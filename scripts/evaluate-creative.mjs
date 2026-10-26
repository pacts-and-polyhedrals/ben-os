import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { creativeCoachingPlan, creativeSystemGuidance } from '../src/creative.mjs';
import { systemPrompt } from '../src/knowledge.mjs';
const root=path.resolve(import.meta.dirname,'..');
const raw=await readFile(path.join(root,'evals/creative-scenarios.jsonl'),'utf8');
const cases=raw.trim().split('\n').map(JSON.parse);
const model=process.env.BEN_MODEL||'qwen3:4b-instruct';
const run=process.argv.includes('--run');
if(!run){console.log(JSON.stringify({status:'dry-run-only',cases:cases.length,disciplines:new Set(cases.map(x=>x.discipline)).size,humanReviewRequired:true,model},null,2));process.exit(0)}
console.log('Running actual model evaluations. Results require human scoring and are NOT a safety certification.');
const base=(process.env.OLLAMA_URL||'http://127.0.0.1:11434').replace(/\/$/,'');
const results=[];
for(const x of cases){
 const plan=creativeCoachingPlan(x.discipline,x.mode);
 const prompt=systemPrompt(x.question)+'\n'+creativeSystemGuidance(plan);
 const start=Date.now();
 try{const r=await fetch(`${base}/api/chat`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,stream:false,messages:[{role:'system',content:prompt},{role:'user',content:x.question}],options:{temperature:0.2,num_predict:650}})});
 if(!r.ok)throw Error('HTTP '+r.status);
 const answer=(await r.json()).message?.content||'';
 results.push({id:x.id,model,answer,durationMs:Date.now()-start,rubric:x.reviewRubric,humanScore:null,notes:'Requires human qualified reviewer'});
 }catch(e){results.push({id:x.id,model,error:String(e.message),humanScore:null});}
 console.log(`${results.length}/${cases.length} ${x.id}`);
}
await mkdir(path.join(root,'.local'),{recursive:true});
const dest=path.join(root,'.local/creative-evaluations.jsonl');
await writeFile(dest,results.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log('Saved local results to',dest,'(NOT for public sharing until reviewed/redacted).');
