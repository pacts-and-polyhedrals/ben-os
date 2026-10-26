import assert from 'node:assert/strict';
import { test } from 'node:test';
import { systemPrompt } from '../src/knowledge.mjs';
import { creativeCoachingPlan,creativeSystemGuidance } from '../src/creative.mjs';
test('creative AI system instructions ground replies in human authorship and unadopted B.E.N. rules',()=>{
 const base=systemPrompt('How do founders decide about community art?');
 const plan=creativeCoachingPlan('painting','critique','I want detailed feedback on my own colour study.');
 const coaching=creativeSystemGuidance(plan);
 assert.match(base,/NOT adopted policy/);
 assert.match(base,/Ten FOUNDING PRINCIPLES/i);
 assert.match(base,/social-credit/);
 assert.match(coaching,/HUMAN AUTHORSHIP/);
 assert.match(coaching,/never a substitute artist/i);
 assert.match(coaching,/Do not complete a poem, painting, song/);
});
