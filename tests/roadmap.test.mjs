import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const config=new URL('../config/',import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(n,config),'utf8'));
test('all 53 roadmap modules and 212 tasks are traceable and have no circular dependencies',()=>{
 const roadmap=read('roadmap-modules.json'),issues=read('roadmap-issues.json'),delivery=read('module-delivery-status.json');
 assert.equal(roadmap.modules.length,53);assert.equal(issues.issues.length,212);assert.equal(delivery.modules.length,53);
 const modules=new Map(roadmap.modules.map(x=>[x.id,x]));assert.equal(modules.size,53);
 const status=new Map(delivery.modules.map(x=>[x.id,x]));assert.equal(status.size,53);
 const issueIds=new Set();for(const item of issues.issues){assert(!issueIds.has(item.id));issueIds.add(item.id);const m=modules.get(item.moduleId);assert(m,item.id);assert.equal(item.release,m.release);}
 const visited=new Set(),stack=new Set();function visit(id){assert(modules.has(id),'missing dependency '+id);assert(!stack.has(id),'circular dependency at '+id);if(visited.has(id))return;stack.add(id);for(const dep of modules.get(id).depends)visit(dep);stack.delete(id);visited.add(id);}
 for(const m of roadmap.modules){visit(m.id);assert.equal(status.get(m.id).targetRelease,m.release);assert(['planned','prototype_partial','verified_complete'].includes(status.get(m.id).stage));}
 assert.equal(delivery.modules.filter(x=>x.stage==='verified_complete').length,0,'No production-ready modules can be certified by source tests alone.');
});
test('human-first curriculum has 48 draft practitioner packets and 57 evaluation cases',()=>{
 const catalog=read('creative-curriculum.json');assert.equal(catalog.disciplines.length,48);
 const names=new Set(catalog.disciplines.map(x=>x.id));assert.equal(names.size,48);
 const folder=path.resolve('docs/creative-packets');const files=new Set(readdirSync(folder));for(const id of names){assert(files.has(id+'.md'),id);const text=readFileSync(path.join(folder,id+'.md'),'utf8');assert.match(text,/NOT yet independently reviewed/);assert.match(text,/Four-stage learning track/);}
 const lines=readFileSync(new URL('../evals/creative-scenarios.jsonl',import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
 assert.equal(lines.length,57);assert.equal(new Set(lines.map(x=>x.id)).size,57);
 for(const line of lines){assert(names.has(line.discipline));assert(line.reviewRubric)}
});
