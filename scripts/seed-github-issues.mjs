import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(path.join(root,'config/launch-actions.json'),'utf8'));
const apply=process.argv.includes('--apply');
const issueTitle=a=>`${a.id} | ${a.title}`;
function issueBody(a){return `**Imported from:** B.E.N. Control Centre v0.2 (1 October 2026)\n**Record ID:** ${a.id}\n**Workstream:** ${a.workstream}\n**Priority:** ${a.priority}\n**Source status:** Not started (dated snapshot; verify before relying on it)\n**Owner:** Unassigned\n**Policy reference:** ${a.policyRef}\n\n## Suggested next step\n${a.nextStep}\n\n## Acceptance / review checklist\n- [ ] Confirm this remains outstanding with current founders\n- [ ] Assign an authorised lead and backup where needed\n- [ ] Provide non-sensitive evidence or its permissioned record reference\n- [ ] Check if the task requires an independent review or reserved Board vote\n- [ ] Record the relevant DEC ID and next action before treating it as complete\n\n## Privacy and governance\nDo not place member identities, safeguarding reports, appeals, passwords, bank details, consent evidence or health information here. GitHub issue status **does not** constitute adoption, a vote, permission to spend or a finding about another person.\n`}
if(!apply){console.log(`DRY RUN — ${data.actions.length} proposed actions; nothing will be written to GitHub.`);for(const a of data.actions)console.log(`  ${issueTitle(a)}`);console.log('To import into a verified NEW B.E.N. repo after gh auth login: npm run seed:apply');process.exit(0)}
function gh(args){return execFileSync('gh',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}
try{
 const repo=JSON.parse(gh(['repo','view','--json','nameWithOwner,isPrivate']));
 if(!repo.isPrivate)throw Error('Refusing to seed: current GitHub repository is public. Start in a private repo.');
 console.log(`Target: ${repo.nameWithOwner} (private).`);
 const existing=new Set(JSON.parse(gh(['issue','list','--state','all','--limit','500','--json','title'])).map(x=>(x.title||'').split(' | ')[0]));
 const tempdir=path.join(root,'.local');await mkdir(tempdir,{recursive:true});
 let created=0,skipped=0;
 for(const a of data.actions){
  if(existing.has(a.id)){console.log(`Skip ${a.id}: existing issue found`);skipped++;continue}
  const file=path.join(tempdir,'seed-issue.md');await writeFile(file,issueBody(a));
  const out=gh(['issue','create','--title',issueTitle(a),'--body-file',file]);
  console.log(`${a.id}: ${out}`);created++;
 }
 console.log(`Complete: ${created} created, ${skipped} skipped. Assign actual owners/status only after founder verification.`);
}catch(err){console.error('No changes assumed complete. Check your GitHub auth/repo and re-run; duplicate ACT IDs are skipped.');console.error(err.stderr?.toString()||err.message);process.exitCode=1}
