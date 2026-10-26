import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync,existsSync } from 'node:fs';
import { charter, backlog, roles, findKnowledge,systemPrompt } from '../src/knowledge.mjs';
import { creativeCurriculum,creativeCoachingPlan,creativeSystemGuidance } from '../src/creative.mjs';
import { openDatabase } from '../src/db.mjs';
import { createServer } from '../src/server.mjs';

test('B.E.N. baseline principles and proposals cannot be mistaken for adopted policy',()=>{
 assert.equal(charter.principles.length,10);
 assert.equal(charter.benTest.length,9);
 assert.equal(backlog.actions.length,22);
 assert(backlog.actions.every(a=>a.owner===null&&a.status==='Not started'));
 assert.equal(roles.roles.length,6);
 assert(roles.roles.every(x=>x.lead===null));
 assert.match(systemPrompt('What did the Bens vote?'),/NOT adopted policy/);
 assert.match(systemPrompt('How are people judged?'),/never propose social-credit exclusion/);
 assert(findKnowledge('appeal a ban due to harassment').some(x=>x.id==='safety'));
});
test('all 48 creative disciplines have human-led coaching exercises, not finished art',()=>{
 const ids=new Set();assert.equal(creativeCurriculum.disciplines.length,48);
 for(const d of creativeCurriculum.disciplines){assert(!ids.has(d.id));ids.add(d.id);assert(d.techniques.length>=3);assert(d.feedbackQuestions.length>=2);assert(d.starterExercise.length>=30);assert(d.advancedChallenge.length>=30);}
 assert(ids.has('painting'));assert(ids.has('dance'));assert(ids.has('poetry'));assert(ids.has('music-composition'));assert(ids.has('game-design'));
 const plan=creativeCoachingPlan('dance','critique','Movement to express grief');assert(plan);
 const prompt=creativeSystemGuidance(plan);assert.match(prompt,/never a substitute artist/i);assert.match(prompt,/Do not complete a poem, painting, song/);
 assert.equal(creativeCoachingPlan('fake','practice'),null);
});
test('public static bundle has no private Google Drive URL, credentials or member data',()=>{
 for(const file of ['dist/index.html','dist/data/charter.json','dist/data/creative-curriculum.json','dist/data/roadmap-modules.json'])assert(existsSync(file));
 const charterPublic=readFileSync('dist/data/charter.json','utf8');assert(!charterPublic.includes('docs.google.com'));
 const staticJs=readFileSync('dist/app.js','utf8');assert(!staticJs.includes('GITHUB_CLIENT_SECRET'));
 const html=readFileSync('dist/index.html','utf8');assert.match(html,/Be Even Nicer/);assert.match(html,/Skip to content/);
});
test('health and public creative catalogue work with no authentication; private routes reject outsiders',async()=>{
 const db=openDatabase(':memory:');const cfg={baseUrl:'http://127.0.0.1:8787',clientId:'',clientSecret:'',founderIds:new Set(),stewardIds:new Set(),signupsEnabled:false,adoptedCode:''};
 const server=createServer({db,config:cfg});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  let r=await fetch(base+'/api/catalog');assert.equal(r.status,200);assert.equal((await r.json()).disciplines.length,48);
  r=await fetch(base+'/api/roadmap');assert.equal(r.status,200);assert.equal((await r.json()).modules.length,53);
  r=await fetch(base+'/api/member/overview');assert.equal(r.status,401);
  r=await fetch(base+'/api/steward/launch');assert.equal(r.status,401);
  r=await fetch(base+'/api/ai/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'make a song'})});assert.equal(r.status,401);
  r=await fetch(base+'/../../src/auth.mjs');assert.equal(r.status,404);
  r=await fetch(base+'/');assert.equal(r.status,200);
 }finally{await new Promise(r=>server.close(r));db.close()}
});
