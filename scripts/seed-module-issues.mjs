#!/usr/bin/env node
// B.E.N. proposed backlog importer. Dry-run unless --apply; never imports confidential material.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const issues=JSON.parse(readFileSync(path.join(root,'config/roadmap-issues.json'),'utf8')).issues;
const args=process.argv.slice(2);
function arg(name){const i=args.indexOf(name);if(i<0)return null;return args[i+1]??null;}
const repo=arg('--repo'),release=arg('--release'),apply=args.includes('--apply'),limit=Number(arg('--limit')||25),offset=Number(arg('--offset')||0);
const releases=['0.1.1','0.2','0.3','0.4','0.5','0.6','0.7','1.0'];
function usage(){console.log(`B.E.N. Issue importer (dry-run by default)

  node scripts/seed-module-issues.mjs --repo ORG/ben-os --release 0.1.1
  node scripts/seed-module-issues.mjs --repo ORG/ben-os --release 0.1.1 --apply
  node scripts/seed-module-issues.mjs --repo ORG/ben-os --release 0.2 --limit 15 --offset 15 --apply

Requires GitHub CLI 'gh' logged into an authorized account for --apply.
Creation is capped at --limit per run; --offset selects the next batch. Existing exact issue titles are skipped.
The importer NEVER creates votes, member accounts, policies or private case records.`);}
if(args.includes('--help')){usage();process.exit(0);}
if(release!==null && !releases.includes(release))throw Error('Unknown --release. Expected: '+releases.join(', '));
if(repo!==null && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))throw Error('Invalid --repo. Use ORG/ben-os syntax.');
if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('--limit must be an integer between 1 and 100.');
if(!Number.isInteger(offset)||offset<0)throw Error('--offset must be a nonnegative integer.');
if(apply && (!repo||!release))throw Error('--apply requires both --repo ORG/REPO and --release VALUE.');
const selected=issues.filter(x=>!release||x.release===release);
console.log(`B.E.N. planning backlog v0.3: ${selected.length} candidate issues ${release?`for ${release}`:'across all releases'}.`);
console.log(`Mode: ${apply?'EXPLICIT CREATE':'DRY RUN ONLY'}; batch offset=${offset}; maximum per invocation: ${limit}.`);
const presented=selected.slice(offset,offset+limit);
for(const it of presented)console.log(`  [${it.id}] ${it.title}  (${it.priority}; dependencies: ${it.dependsOnModules.join(',')||'none'})`);
if(selected.length>offset+limit)console.log(`... ${selected.length-offset-limit} later candidate issues; use --offset ${offset+limit} for next batch.`);
if(!apply){console.log('\nNo GitHub writes performed. Review docs/GITHUB_APP_SETUP.md and docs/DELIVERY_TRACKER.md; only use --apply after owner authorization.');process.exit(0);}
// Protect confidential development planning from accidentally landing in a public repo.
try {
 const target=JSON.parse(execFileSync('gh',['repo','view',repo,'--json','isPrivate,nameWithOwner'],{encoding:'utf8',timeout:30000}));
 if(!target.isPrivate)throw Error('The target repository is PUBLIC; refusing to import the working backlog.');
 console.log('Verified target:',target.nameWithOwner,'is private.');
} catch(e) {throw Error('Repository private-status verification failed: '+(e.message||e));}
let exists=[];
try{exists=JSON.parse(execFileSync('gh',['issue','list','--repo',repo,'--state','all','--limit','1000','--json','title'],{encoding:'utf8',timeout:30000}));}
catch(e){throw Error('Cannot read repo issues. Confirm repository exists and `gh auth login` succeeded before applying. '+(e.message||e));}
const existingTitles=new Set(exists.map(x=>x.title));
let created=0,skipped=0;
for(const item of presented){
 const title=`[${item.id}] ${item.title}`;
 if(existingTitles.has(title)){console.log(`SKIP duplicate: ${title}`);skipped++;continue;}
 const body=[
 `> Proposed B.E.N. development task, not an adopted policy or Board decision.`,
 `**Module:** ${item.moduleId}  \n**Release:** ${item.release}  \n**Priority:** ${item.priority}  \n**Audience:** ${item.audience}  \n**Complexity:** ${item.complexity}  \n**Dependencies:** ${item.dependsOnModules.join(', ')||'none'}  \n**B.E.N. source IDs:** ${item.sourceRefs.join(', ')}`,
 `## Purpose\n${item.summary}`,
 `## Workflow context\n${item.context}`,
 '## Acceptance criteria',
 ...item.acceptance.map(x=>'- [ ] '+x),
 '**Operating safeguard:** Do not put member identities, reports, case evidence, account details, passwords, healthcare details, fundraising credentials or confidential allegations in this Issue. An Issue closure is not policy adoption or a vote.'
 ].join('\n\n');
 try{
  const url=execFileSync('gh',['issue','create','--repo',repo,'--title',title,'--body',body],{encoding:'utf8',timeout:30000}).trim();
  console.log(`CREATED ${item.id} ${url}`);created++;existingTitles.add(title);
 }catch(e){console.error(`FAILED ${item.id}; import halted to avoid repeated attempts. Existing prior creates remain in GitHub.`);process.exitCode=1;break;}
}
console.log(`Completed. Created=${created}, skipped existing=${skipped}. Check GitHub Project membership/fields manually.`);
