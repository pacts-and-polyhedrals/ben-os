import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../cloudflare-worker.mjs';

const url='https://ben-os-staging.selvagrow7.workers.dev';
function mockEnv({db=true,board=true}={}){
 const DB={prepare(sql){if(sql.includes('founder_updates')&&!board)throw Error('missing table');
   return {async first(){return sql.includes('SELECT 1 AS ok')?{ok:db?1:0}:{n:0}}};}};
 return {DB,GITHUB_CLIENT_ID:'Iv1.fake',GITHUB_CLIENT_SECRET:'TEST_SECRET_NOT_FOR_PAGES',BEN_BASE_URL:url,BEN_FOUNDER_GITHUB_IDS:'289798828'};
}
test('public build status is read-only, safe and does not leak auth secrets or source identifiers', async()=>{
 const r=await handleRequest(new Request(url+'/api/public-build-status',{headers:{origin:'https://pacts-and-polyhedrals.github.io'}}),mockEnv());
 assert.equal(r.status,200);
 assert.equal(r.headers.get('access-control-allow-origin'),'https://pacts-and-polyhedrals.github.io');
 const s=await r.text();const data=JSON.parse(s);
 assert.equal(data.version,'0.3.3');
 assert.equal(data.runtime.environment,'founder-staging');
 assert.equal(data.runtime.databaseConnected,true);
 assert.equal(data.runtime.founderWorkspaceReady,true);
 assert.equal(data.runtime.githubLoginConfigured,true);
 assert.equal(data.runtime.driveConnected,false);
 assert.equal(data.certification,'not-assessed');
 for(const secret of ['TEST_SECRET_NOT_FOR_PAGES','289798828','https://docs.google.com','session','clientId'])assert(!s.includes(secret),secret);
});
test('failure or missing schema lowers public operational flags rather than pretending readiness',async()=>{
 const r=await handleRequest(new Request(url+'/api/public-build-status'),mockEnv({db:false,board:false}));
 assert.equal(r.status,200); const d=await r.json();
 assert.equal(d.runtime.databaseConnected,false);assert.equal(d.runtime.founderWorkspaceReady,false);
});
test('all P01-P06 have separately evidenced milestones and unresolved gates; none are certified',()=>{
 const d=JSON.parse(readFileSync(new URL('../config/module-delivery-status.json',import.meta.url),'utf8'));
 for(let n=1;n<=6;n++){const id=`P0${n}`,m=d.modules.find(x=>x.id===id);assert(m,id);assert.equal(m.stage,'prototype_partial');assert(m.operationalMilestone);assert(m.whatExists.length>30);assert(m.remainingGates.length>=2);}
 assert.equal(d.modules.filter(x=>x.stage==='verified_complete').length,0);
 const js=readFileSync(new URL('../site/app.js',import.meta.url),'utf8');
 assert(js.includes('/api/public-build-status'));
 assert(js.includes('release gates remain'));
});
