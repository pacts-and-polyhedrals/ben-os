import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('ethics and open-source requirements are explicit and cannot be misrepresented',()=>{
 const ethics=read('docs/AI_ETHICS_CHARTER.md'),open=read('docs/OPEN_SOURCE_STRATEGY.md'),model=read('docs/MODEL_CARD.md');
 for(const term of ['Human-first creative','No person','not a newly trained foundation model','human'] ){
  assert(ethics.toLowerCase().includes(term.toLowerCase()),term)
 }
 assert.match(ethics,/not yet been formally adopted/i);
 assert.match(open,/has yet been granted/i);
 assert.match(open,/AGPL-3\.0-or-later/);
 assert.match(model,/not.*trained or fine-tuned a new foundation model/i);
 assert.equal(JSON.parse(read('package.json')).license,'UNLICENSED');
});
test('no backend secrets in copied static data',()=>{
 const files=['dist/index.html','dist/app.js','dist/styles.css','dist/data/charter.json','dist/data/creative-curriculum.json','dist/data/roadmap-modules.json'];
 const content=files.map(read).join('\n');
 for(const forbidden of ['GITHUB_CLIENT_SECRET=','BEN_FOUNDER_GITHUB_IDS=','BEGIN RSA PRIVATE KEY','docs.google.com/document/d/'])assert(!content.includes(forbidden),forbidden);
});
