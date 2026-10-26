import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handleRequest } from '../cloudflare-worker.mjs';

const BASE='https://ben-os-staging.selvagrow7.workers.dev';
function dbMock(){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(`PRAGMA foreign_keys=ON;
  CREATE TABLE users(id TEXT PRIMARY KEY, github_id INTEGER UNIQUE NOT NULL,github_login TEXT NOT NULL,display_name TEXT NOT NULL,joined_at INTEGER NOT NULL,last_login INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',code_version TEXT,adult_attested INTEGER NOT NULL DEFAULT 0,creative_bio TEXT NOT NULL DEFAULT '',creative_disciplines TEXT NOT NULL DEFAULT '[]',creative_tags TEXT NOT NULL DEFAULT '[]',open_to_collab INTEGER NOT NULL DEFAULT 0,open_to_mentor INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE oauth_states(hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL);
  CREATE TABLE sessions(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`);
  return {raw:sqlite,prepare(sql){const stmt=sqlite.prepare(sql);return {bind(...args){return {first:async()=>stmt.get(...args)||null,run:async()=>({meta:{changes:stmt.run(...args).changes}}),all:async()=>stmt.all(...args)}},first:async()=>stmt.get()||null}}};
}
function environment(){return {DB:dbMock(),GITHUB_CLIENT_ID:'Iv1.test',GITHUB_CLIENT_SECRET:'secret-not-logged',BEN_BASE_URL:BASE,BEN_FOUNDER_GITHUB_IDS:'289798828'}};
function request(path,opts={}){return new Request(BASE+path,opts);}
function cookieFrom(res,name){const vals=res.headers.getSetCookie();const value=vals.find(x=>x.startsWith(name+'='));return value?.split(';')[0]||'';}
function githubAPI(id=289798828){return async url=>{if(url.includes('access_token'))return Response.json({access_token:'sample-user-token'});if(url.endsWith('/user'))return Response.json({id,login:id===289798828?'pacts-and-polyhedrals':'stranger',name:'BEN Tester'});return new Response('no', {status:404})}}
async function signIn(env,id=289798828){
 const start=await handleRequest(request('/auth/github'),env,githubAPI(id));
 assert.equal(start.status,302);
 const authUrl=new URL(start.headers.get('location'));
 const state=authUrl.searchParams.get('state');
 const callback=await handleRequest(request(`/auth/github/callback?state=${state}&code=example`,{headers:{cookie:cookieFrom(start,'__Host-ben_oauth_state')}}),env,githubAPI(id));
 return {start,callback,state};
}
test('config errors fail closed without crashing',async()=>{const r=await handleRequest(request('/'),{DB:dbMock(),BEN_BASE_URL:BASE});assert.equal(r.status,503);});
test('health reports database and registration remains disabled',async()=>{const r=await handleRequest(request('/api/health'),environment());const j=await r.json();assert.equal(j.databaseConnected,true);assert.equal(j.registrationEnabled,false);});
test('sign-in URL includes GitHub App, exact callback, state, no repo scope',async()=>{const env=environment();const r=await handleRequest(request('/auth/github'),env);const u=new URL(r.headers.get('location'));assert.equal(u.searchParams.get('client_id'),'Iv1.test');assert.equal(u.searchParams.get('redirect_uri'),BASE+'/auth/github/callback');assert.ok(u.searchParams.get('state').length>32);assert.equal(u.searchParams.get('scope'),null);assert.ok(cookieFrom(r,'__Host-ben_oauth_state').includes('__Host-'));});
test('missing state cookie rejected without calling GitHub',async()=>{const env=environment();const r=await handleRequest(request('/auth/github/callback?state=bad&code=bad'),env,()=>{throw Error('should not call')});assert.equal(r.status,302);assert.match(r.headers.get('location'),/invalid-state/);assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n,0);});
test('unlisted GitHub account is rejected without storing identity',async()=>{const env=environment();const {callback}=await signIn(env,332211);assert.match(callback.headers.get('location'),/not-authorized/);assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n,0);});
test('founder account gets secure session and protected dashboard',async()=>{const env=environment();const {callback,state,start}=await signIn(env);assert.equal(callback.headers.get('location'),'/admin');const session=cookieFrom(callback,'__Host-ben_session');assert.ok(session);assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n,1);const user=await handleRequest(request('/api/me',{headers:{cookie:session}}),env);const j=await user.json();assert.equal(j.user.role,'founder');assert.equal(j.user.githubId,289798828);const dash=await handleRequest(request('/admin',{headers:{cookie:session}}),env);assert.equal(dash.status,200);assert.match(await dash.text(),/GitHub identity verified/);
  const replay=await handleRequest(request(`/auth/github/callback?state=${state}&code=replay`,{headers:{cookie:cookieFrom(start,'__Host-ben_oauth_state')}}),env,githubAPI());assert.match(replay.headers.get('location'),/invalid-state/);
});
test('session value alone cannot bypass role allowlist',async()=>{const env=environment();const {callback}=await signIn(env);const session=cookieFrom(callback,'__Host-ben_session');env.BEN_FOUNDER_GITHUB_IDS='';const r=await handleRequest(request('/admin',{headers:{cookie:session}}),env);assert.equal(r.status,403);});
test('logout rejects untrusted origin and missing csrf',async()=>{const env=environment();const {callback}=await signIn(env);const session=cookieFrom(callback,'__Host-ben_session');const form=new URLSearchParams({csrf:'fake'});const res=await handleRequest(request('/auth/logout',{method:'POST',headers:{cookie:session,origin:'https://evil.example'},body:form}),env);assert.equal(res.status,403);const res2=await handleRequest(request('/auth/logout',{method:'POST',headers:{cookie:session,origin:BASE},body:form}),env);assert.equal(res2.status,403);});
test('valid CSRF sign-out revokes the active session',async()=>{
 const env=environment();const {callback}=await signIn(env);
 const session=cookieFrom(callback,'__Host-ben_session');
 const row=env.DB.raw.prepare('SELECT csrf FROM sessions LIMIT 1').get();
 const res=await handleRequest(request('/auth/logout',{
   method:'POST',headers:{cookie:session,origin:BASE},body:new URLSearchParams({csrf:row.csrf})
 }),env);
 assert.equal(res.status,302);
 const noSession=await handleRequest(request('/api/me',{headers:{cookie:session}}),env);
 assert.equal((await noSession.json()).user,null);
});
test('suspended user cannot obtain an authenticated session',async()=>{
 const env=environment();const {callback}=await signIn(env);assert.equal(callback.status,302);
 env.DB.raw.prepare("UPDATE users SET status='suspended'").run();
 const session=cookieFrom(callback,'__Host-ben_session');
 const r=await handleRequest(request('/api/me',{headers:{cookie:session}}),env);
 assert.equal((await r.json()).user,null);
});
