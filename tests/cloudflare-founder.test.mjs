import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handleRequest } from '../cloudflare-worker.mjs';
const BASE='https://ben-os-staging.selvagrow7.workers.dev';
const migration=readFileSync(new URL('../ben-founder-schema.sql', import.meta.url), 'utf8');
function dbMock(){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(`PRAGMA foreign_keys=ON;
  CREATE TABLE users(id TEXT PRIMARY KEY, github_id INTEGER UNIQUE NOT NULL,github_login TEXT NOT NULL,display_name TEXT NOT NULL,joined_at INTEGER NOT NULL,last_login INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',code_version TEXT,adult_attested INTEGER NOT NULL DEFAULT 0,creative_bio TEXT NOT NULL DEFAULT '',creative_disciplines TEXT NOT NULL DEFAULT '[]',creative_tags TEXT NOT NULL DEFAULT '[]',open_to_collab INTEGER NOT NULL DEFAULT 0,open_to_mentor INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE oauth_states(hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL);
  CREATE TABLE sessions(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`);
  function stmt(sql, args=[]){return {
    bind(...next){return stmt(sql, next)},
    async first(){return sqlite.prepare(sql).get(...args) || null},
    async all(){return {results:sqlite.prepare(sql).all(...args)}},
    async run(){return {meta:{changes:sqlite.prepare(sql).run(...args).changes}}},
  }}
  return {raw:sqlite,prepare:sql=>stmt(sql),async batch(statements){
    sqlite.exec('BEGIN');try{const out=[];for(const statement of statements)out.push(await statement.run());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}
  }};
}
const req=(path,opts={})=>new Request(BASE+path,opts);
const cookie=(res,name)=>res.headers.getSetCookie().find(x=>x.startsWith(name+'='))?.split(';')[0]||'';
function env(){return {DB:dbMock(),GITHUB_CLIENT_ID:'Iv1.test',GITHUB_CLIENT_SECRET:'secret',BEN_BASE_URL:BASE,BEN_FOUNDER_GITHUB_IDS:'289798828'}};
const mockGitHub=async url=>url.includes('access_token')?Response.json({access_token:'sample'}):Response.json({id:289798828,login:'pacts-and-polyhedrals',name:'BEN Founder'});
async function login(environment){const start=await handleRequest(req('/auth/github'),environment,mockGitHub);const s=new URL(start.headers.get('location')).searchParams.get('state');const callback=await handleRequest(req(`/auth/github/callback?state=${s}&code=fake`,{headers:{cookie:cookie(start,'__Host-ben_oauth_state')}}),environment,mockGitHub);assert.equal(callback.status,302);const ses=cookie(callback,'__Host-ben_session');const csrf=environment.DB.raw.prepare('SELECT csrf FROM sessions').get().csrf;return {session:ses,csrf};}
function form({csrf,actionId='ACT-001',state='in_progress',publicNote='The founders started the document review.',evidenceRef='DOC-REF-3'}={}){return new URLSearchParams({csrf,actionId,state,publicNote,evidenceRef});}
function post(session,params,origin=BASE){return req('/admin/task',{method:'POST',headers:{cookie:session,origin},body:form(params)})}

test('staging login and health work before the new migration',async()=>{const e=env(),{session}=await login(e);const h=await (await handleRequest(req('/api/health'),e)).json();assert.equal(h.databaseConnected,true);assert.equal(h.founderWorkspaceReady,false);const dash=await handleRequest(req('/admin',{headers:{cookie:session}}),e);assert.equal(dash.status,200);assert.match(await dash.text(),/One more setup step required/);});
test('no private board info is returned to guests',async()=>{const e=env();e.DB.raw.exec(migration);const a=await handleRequest(req('/api/steward/launch'),e);assert.equal(a.status,403);const b=await handleRequest(req('/admin'),e);assert.equal(b.status,302);const c=await handleRequest(req('/admin/task',{method:'POST',headers:{origin:BASE},body:form({csrf:'x'})}),e);assert.equal(c.status,403);});
test('migration creates two tables and can safely rerun',()=>{const e=env();e.DB.raw.exec(migration);e.DB.raw.exec(migration);assert.equal(e.DB.raw.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('audit','founder_updates')").get().n,2);});
test('founder board lists 22 correct source tasks, all unstarted before progress',async()=>{const e=env();e.DB.raw.exec(migration);const {session}=await login(e);const r=await handleRequest(req('/api/steward/launch',{headers:{cookie:session}}),e);assert.equal(r.status,200);const x=await r.json();assert.equal(x.actions.length,22);assert.equal(x.totals.not_started,22);assert.ok(x.actions.find(a=>a.id==='ACT-001'&&a.title==='Review and agree Charter and Code'));const page=await handleRequest(req('/admin',{headers:{cookie:session}}),e);assert.match(await page.text(),/ACT-022/);});
test('founder can update one task with a CSRF-protected form, creating audit record',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);const r=await handleRequest(post(session,{csrf}),e);assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/admin?updated=ACT-001');const row=e.DB.raw.prepare('SELECT * FROM founder_updates WHERE action_id=?').get('ACT-001');assert.equal(row.state,'in_progress');assert.equal(row.public_note,'The founders started the document review.');assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM audit').get().n,1);const x=await (await handleRequest(req('/api/steward/launch',{headers:{cookie:session}}),e)).json();assert.equal(x.totals.in_progress,1);assert.equal(x.totals.not_started,21);});
test('without CSRF or with hostile origin, updates cannot occur',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);const bad=await handleRequest(post(session,{csrf:'wrong'}),e);assert.equal(bad.status,403);const evil=await handleRequest(post(session,{csrf},'https://hostile.example'),e);assert.equal(evil.status,403);assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM founder_updates').get().n,0);});
test('removed founder access immediately blocks board updates',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);e.BEN_FOUNDER_GITHUB_IDS='';const r=await handleRequest(post(session,{csrf}),e);assert.equal(r.status,403);const list=await handleRequest(req('/api/steward/launch',{headers:{cookie:session}}),e);assert.equal(list.status,403);});
test('completed tasks require evidence; unknown IDs and sensitive notes are refused',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);assert.equal((await handleRequest(post(session,{csrf,state:'completed',evidenceRef:''}),e)).status,400);assert.equal((await handleRequest(post(session,{csrf,actionId:'ACT-900'}),e)).status,400);assert.equal((await handleRequest(post(session,{csrf,publicNote:'Email me at private@example.com'}),e)).status,400);assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM founder_updates').get().n,0);});
test('task display escapes notes rather than rendering arbitrary HTML',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);const r=await handleRequest(post(session,{csrf,publicNote:'<img src=x onerror=alert(1)>',evidenceRef:'GH-1'}),e);assert.equal(r.status,303);const page=await handleRequest(req('/admin',{headers:{cookie:session}}),e);const html=await page.text();assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.ok(!html.includes('value="<img'));});
test('login session and health remain functional after a saved task update',async()=>{const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);await handleRequest(post(session,{csrf}),e);const h=await (await handleRequest(req('/api/health'),e)).json();assert.equal(h.version,'0.3.3');assert.equal(h.founderWorkspaceReady,true);const me=await (await handleRequest(req('/api/me',{headers:{cookie:session}}),e)).json();assert.equal(me.user.role,'founder');});
test('oversized founder task forms are refused before parsing',async()=>{
 const e=env();e.DB.raw.exec(migration);const {session,csrf}=await login(e);
 const r=await handleRequest(post(session,{csrf,publicNote:'x'.repeat(5000)}),e);
 assert.equal(r.status,413);
 assert.equal(e.DB.raw.prepare('SELECT COUNT(*) AS n FROM founder_updates').get().n,0);
});
