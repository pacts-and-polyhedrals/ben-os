import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openDatabase } from '../src/db.mjs';
import { createServer } from '../src/server.mjs';
function config(){return {baseUrl:'http://127.0.0.1:8787',clientId:'test-app-id',clientSecret:'test-secret',founderIds:new Set([1001]),stewardIds:new Set([1003]),signupsEnabled:true,adoptedCode:'BEN-02-ADOPTED-TEST-ONLY'}}
async function setup(){
 const db=openDatabase(':memory:'),cfg=config();
 const provider={exchangeCode:async(code)=>code,getGitHubUser:async(token)=>({id:token==='founder'?1001:token==='steward'?1003:token==='artist'?1004:1002,login:'person-'+token,name:token})};
 const sent=[];const github={status:()=>({configured:true,repository:'ben/ben-os'}),listIssues:async()=>[{number:1,title:'Approved issue',html_url:'https://github.com/example/ben-os/issues/1'}],publishProposal:async a=>{sent.push(a.id);return {number:101,url:'https://github.com/example/ben-os/issues/101'}}};
 const server=createServer({db,config:cfg,authProvider:provider,github,modelFetch:async(_,opts)=>{const b=JSON.parse(opts.body);sent.push(b.messages[0].content);return new Response(JSON.stringify({message:{content:'Try a small study first, then reflect on the gesture you chose.'}}),{status:200,headers:{'content-type':'application/json'}})}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const req=async(path,options={})=>fetch(base+path,{redirect:'manual',...options});
 async function signIn(code){
  let r=await req('/auth/github');assert.equal(r.status,302);
  const redirect=new URL(r.headers.get('location'));const state=redirect.searchParams.get('state');assert(state);
  const cookie=r.headers.get('set-cookie').split(';')[0];
  r=await req('/auth/github/callback?code='+code+'&state='+encodeURIComponent(state),{headers:{cookie}});assert.equal(r.status,302);
  const cookies=r.headers.getSetCookie();const session=cookies.find(x=>x.startsWith('ben_session='));assert(session);
  const cookieSession=session.split(';')[0];let me=await req('/api/me',{headers:{cookie:cookieSession}});assert.equal(me.status,200);
  const data=await me.json();assert(data.csrf);return {cookie:cookieSession,csrf:data.csrf,user:data.user};
 }
 async function api(who,method,path,body,extra={}){const headers={cookie:who?.cookie||'',origin:cfg.baseUrl,'x-ben-csrf':who?.csrf||'','content-type':'application/json',...extra};return req(path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});}
 async function close(){await new Promise(r=>server.close(r));db.close()}
 return {db,cfg,req,signIn,api,sent,close};
}
test('login uses immutable GitHub identity; normal member cannot reach founder console or edit GitHub',async()=>{
 const s=await setup();try{
  const member=await s.signIn('member'),founder=await s.signIn('founder');
  assert.equal(member.user.role,'member');assert.equal(member.user.status,'pending');
  assert.equal(founder.user.role,'founder');
  let r=await s.req('/api/steward/launch',{headers:{cookie:member.cookie}});assert.equal(r.status,403);
  r=await s.api(member,'POST','/api/steward/launch',{actionId:'ACT-001',state:'completed'});assert.equal(r.status,403);
  r=await s.api(member,'POST','/api/steward/github/publish',{proposalId:'test',confirm:true});assert.equal(r.status,403);
  r=await s.api(member,'POST','/api/onboarding',{adult:true,codeAccepted:true});assert.equal(r.status,200);
  r=await s.req('/api/member/overview',{headers:{cookie:member.cookie}});assert.equal(r.status,200);
  r=await s.req('/api/steward/launch',{headers:{cookie:founder.cookie}});assert.equal(r.status,200);
  r=await s.api(member,'POST','/api/activities',{kind:'project',title:'Community mural',summary:'We would like an accessible neighbourhood mural project.',category:'Community art'});assert.equal(r.status,201);
  const created=await r.json();
  r=await s.req('/api/steward/pending',{headers:{cookie:founder.cookie}});assert.equal(r.status,200);assert((await r.json()).pending.some(x=>x.id===created.id));
  r=await s.api(founder,'POST',`/api/steward/activities/${created.id}/review`,{status:'approved'});assert.equal(r.status,200);
  r=await s.req('/api/activities?kind=project',{headers:{cookie:member.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).activities[0].status,'approved');
 }finally{await s.close()}
});
test('CSRF, invalid login state, private review and sensitive-content guards',async()=>{
 const s=await setup();try{
  let r=await s.req('/auth/github/callback?code=founder&state=forged');assert.equal(r.status,302);assert.match(r.headers.get('location'),/invalid-state/);
  const member=await s.signIn('member'),founder=await s.signIn('founder');
  r=await s.api(member,'POST','/api/onboarding',{adult:true,codeAccepted:true},{'x-ben-csrf':'wrong'});assert.equal(r.status,403);
  r=await s.api(member,'POST','/api/onboarding',{adult:true,codeAccepted:true},{origin:'https://evil.example'});assert.equal(r.status,403);
  r=await s.api(member,'POST','/api/onboarding',{adult:false,codeAccepted:true});assert.equal(r.status,400);
  r=await s.api(member,'POST','/api/onboarding',{adult:true,codeAccepted:true});assert.equal(r.status,200);
  r=await s.api(member,'POST','/api/activities',{kind:'help_request',title:'Need some help',summary:'Call me directly at user@example.org please.',category:'Help'});assert.equal(r.status,400);
  r=await s.api(member,'POST','/api/activities',{kind:'proposal',title:'Better gardens',summary:'Create a community garden learning project to share skills.',category:'Community'});assert.equal(r.status,201);
  const id=(await r.json()).id;
  r=await s.api(member,'POST',`/api/steward/activities/${id}/review`,{status:'approved'});assert.equal(r.status,403);
  r=await s.api(founder,'POST',`/api/steward/activities/${id}/review`,{status:'approved'});assert.equal(r.status,200);
  r=await s.api(founder,'POST','/api/steward/github/publish',{proposalId:id,confirm:true});assert.equal(r.status,403); // same steward cannot approve & publish
  const steward=await s.signIn('steward');
  r=await s.api(steward,'POST','/api/steward/github/publish',{proposalId:id,confirm:true});assert.equal(r.status,201);
  assert(s.sent.includes(id));
  // A second click may not create a duplicate GitHub issue.
  r=await s.api(steward,'POST','/api/steward/github/publish',{proposalId:id,confirm:true});assert.equal(r.status,409);
  assert.equal(s.sent.filter(x=>x===id).length,1);
 }finally{await s.close()}
});
test('opt-in creative profiles, private connections and human-led model guidance',async()=>{
 const s=await setup();try{
  const artist=await s.signIn('artist');const friend=await s.signIn('member');
  for(const u of [artist,friend]){const r=await s.api(u,'POST','/api/onboarding',{adult:true,codeAccepted:true});assert.equal(r.status,200)}
  let r=await s.api(artist,'POST','/api/me/creative',{bio:'I paint, draw and teach beginners.',disciplines:['painting','drawing'],tags:['glazing'],mentoring:true,collaboration:true});assert.equal(r.status,200);
  r=await s.req('/api/creative/directory?discipline=painting',{headers:{cookie:friend.cookie}});assert.equal(r.status,200);
  const found=(await r.json()).creatives;assert.equal(found.length,1);assert(!('githubLogin' in found[0]));
  r=await s.api(friend,'POST','/api/connections',{recipientId:artist.user.id,message:'I am practising colour studies and would love to learn together.'});assert.equal(r.status,201);
  const cid=(await r.json()).id;
  r=await s.req('/api/connections',{headers:{cookie:artist.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).connections[0].id,cid);
  r=await s.api(artist,'POST',`/api/connections/${cid}/reply`,{status:'accepted'});assert.equal(r.status,200);
  r=await s.api(artist,'POST','/api/me/blocks',{targetId:friend.user.id});assert.equal(r.status,200);
  r=await s.req('/api/me/blocks',{headers:{cookie:artist.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).blocks[0].id,friend.user.id);
  r=await s.req('/api/creative/directory?discipline=painting',{headers:{cookie:friend.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).creatives.length,0);
  r=await s.api(friend,'POST','/api/connections',{recipientId:artist.user.id,message:'Another request after a block should be rejected.'});assert.equal(r.status,403);
  r=await s.api(artist,'POST',`/api/me/blocks/${friend.user.id}/remove`,{});assert.equal(r.status,200);

  r=await s.api(artist,'POST','/api/me/creative/journal',{disciplineId:'painting',stage:'foundations',notes:'I studied a small still-life in three tonal values.',reflection:'Try a simpler palette.'});assert.equal(r.status,201);
  const noteId=(await r.json()).id;
  r=await s.req('/api/me/creative/journal',{headers:{cookie:friend.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).entries.length,0);
  r=await s.req('/api/me/creative/journal',{headers:{cookie:artist.cookie}});assert.equal(r.status,200);assert.equal((await r.json()).entries[0].id,noteId);
  r=await s.api(friend,'POST',`/api/me/creative/journal/${noteId}/delete`,{});assert.equal(r.status,404);
  r=await s.req('/api/privacy/export',{headers:{cookie:artist.cookie}});assert.equal((await r.json()).creativeJournal.length,1);
  r=await s.api(artist,'POST',`/api/me/creative/journal/${noteId}/delete`,{});assert.equal(r.status,200);
  r=await s.api(artist,'POST','/api/me/creative/journal',{disciplineId:'fiction',stage:'unknown',notes:'An intentionally invalid stage.'});assert.equal(r.status,400);
  r=await s.api(friend,'POST','/api/ai/chat',{message:'Can you paint the entire work for me?',discipline:'painting',mode:'practice',goal:'Learn glazing'});assert.equal(r.status,200);
  const data=await r.json();assert.match(data.reply,/Try a small study/);
  const prompt=s.sent.find(x=>typeof x==='string');assert.match(prompt,/HUMAN AUTHORSHIP/);
  assert.match(prompt,/never a substitute artist/i);
 }finally{await s.close()}
});
test('registration defaults closed without an actually configured adopted Code',async()=>{
 const db=openDatabase(':memory:');const cfg={...config(),signupsEnabled:false,adoptedCode:''};const provider={exchangeCode:async()=> 'no',getGitHubUser:async()=>({id:1002,login:'member'})};
 const server=createServer({db,config:cfg,authProvider:provider});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{let r=await fetch(base+'/api/me');assert.equal((await r.json()).registrationOpen,false)}finally{await new Promise(r=>server.close(r));db.close()}
});
