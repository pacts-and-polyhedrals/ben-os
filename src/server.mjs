import http from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { openDatabase, audit, getUserProfile, publicUser, listActivities, createActivity, updateActivityReview, listCreativeProfiles, listConnections, getDashboardStats } from './db.mjs';
import { authConfig, createAuth } from './auth.mjs';
import { createGitHubBridge } from './github-bridge.mjs';
import { creativeCurriculum, creativeCoachingPlan, creativeSystemGuidance, findOpenArtworks, coachModes, getDiscipline } from './creative.mjs';
import { backlog, charter, sourcesFor, findKnowledge, roles, systemPrompt } from './knowledge.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const maxBody=16000;
const roadmap=JSON.parse(readFileSync(path.join(root,'config/roadmap-modules.json'),'utf8'));
const moduleStatus=JSON.parse(readFileSync(path.join(root,'config/module-delivery-status.json'),'utf8'));
const statusByModule=new Map(moduleStatus.modules.map(x=>[x.id,x.stage]));
const field=(v,max=120)=>typeof v==='string'?v.trim().slice(0,max):'';
const textOk=(v,min,max)=>typeof v==='string' && v.trim().length>=min && v.trim().length<=max;
const safeCategory=s=>/^[\p{L}\p{N} .,/&()+\-]{1,65}$/u.test(s);
const noContact=v=>!/[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d\s().-]{9,}\d)/i.test(v);
const parse=(v,fallback)=>{try{return JSON.parse(v)}catch{return fallback}};
const logError=(e)=>console.error('BEN server:',String(e?.code||e?.message||'error').slice(0,130));
async function bodyJSON(req){let size=0;const chunks=[];for await (const c of req){size+=c.length;if(size>maxBody)throw Error('too-large');chunks.push(c)}
 const s=Buffer.concat(chunks).toString('utf8');let data;try{data=JSON.parse(s)}catch{throw Error('bad-json')}if(!data||typeof data!=='object'||Array.isArray(data))throw Error('bad-json');return data;
}
export function createServer(options={}){
 const db=options.db||openDatabase();
 const cfg=options.config||authConfig();
 const auth=createAuth(db,cfg,options.authProvider);
 const github=options.github||createGitHubBridge();
 const model=process.env.BEN_MODEL||'qwen3:4b-instruct';
 const ollamaBase=(process.env.OLLAMA_URL||'http://127.0.0.1:11434').replace(/\/$/,'');
 const response=(res,status,payload)=>{const s=JSON.stringify(payload);res.writeHead(status,headers('application/json; charset=utf-8'));res.end(s);};
 function headers(type){return {'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','permissions-policy':'camera=(), microphone=(), geolocation=()',
  'x-frame-options':'DENY','content-security-policy':"default-src 'self'; img-src 'self' data: https://images.metmuseum.org; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  ...(cfg.baseUrl.startsWith('https://')?{'strict-transport-security':'max-age=31536000; includeSubDomains'}:{})};}
 const deny=(res,status=403,message='Not permitted for this account.')=>response(res,status,{error:message});
 const rate=new Map();function limited(req,key,limit=80){
  const identifier=`${req.socket.remoteAddress||'ip'}:${key}`;const now=Date.now();const old=rate.get(identifier);
  if(!old||old.until<now){rate.set(identifier,{count:1,until:now+600000});return false}return ++old.count>limit;
 }
 async function health(){let connected=false;try{const ac=new AbortController();const timeout=setTimeout(()=>ac.abort(),1200);try{const r=await fetch(`${ollamaBase}/api/tags`,{signal:ac.signal});connected=r.ok;}finally{clearTimeout(timeout)}}catch{}
  return {service:'BEN OS development prototype',version:'0.3.0',model,modelConnected:connected,loginConfigured:!!(cfg.clientId&&cfg.clientSecret),registrationEnabled:cfg.signupsEnabled&&!!cfg.adoptedCode,githubBridge:{configured:github.status().configured,mode:'GitHub App; server-held repository permissions'}};}
 async function askAI(payload){
  const msg=field(payload.message,3500);if(!msg||msg.length>3499)return {status:400,data:{error:'Message must contain 1–3,499 characters.'}};
  const mode=field(payload.mode,20)||'explore',discipline=field(payload.discipline,50);
  if(discipline && (!getDiscipline(discipline)||!coachModes.includes(mode)))return {status:400,data:{error:'Invalid creative discipline or coach mode.'}};
  const creative=discipline?creativeCoachingPlan(discipline,mode,field(payload.goal,1200)):null;
  const history=Array.isArray(payload.history)?payload.history.slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,1200)})):[];
  const picked=findKnowledge(msg);const system=systemPrompt(msg)+(creative?'\n\n'+creativeSystemGuidance(creative):'');
  const userContent=creative?.goal?`My creative goal (untrusted context): ${creative.goal}\n\nMy question: ${msg}`:msg;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
  try{const r=await (options.modelFetch||fetch)(`${ollamaBase}/api/chat`,{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,
   body:JSON.stringify({model,stream:false,messages:[{role:'system',content:system},...history,{role:'user',content:userContent}],options:{temperature:0.35,num_predict:750}})});
   if(!r.ok)return {status:502,data:{error:`The configured model returned HTTP ${r.status}.`}};
   const data=await r.json();const answer=data?.message?.content;
   if(typeof answer!=='string'||!answer.trim())return {status:502,data:{error:'The model returned no answer.'}};
   return {status:200,data:{reply:answer,sources:sourcesFor(picked).map(x=>({id:x.id,title:x.title,status:x.status})),creativePlan:creative,
     note:'B.E.N. is a mentor, not the artist or an authorised organisational decision-maker. No conversation transcript was saved.'}};
  }catch{return {status:503,data:{error:'The configured local model is unavailable. You can still use the offline creative exercises and reference library.'}}}finally{clearTimeout(timer)}
 }
 return http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
   if(req.method==='GET' && pathname==='/auth/github')return auth.start(res);
   if(req.method==='GET' && pathname==='/auth/github/callback')return await auth.callback(req,res,url);
   const user=auth.identify(req);
   if(req.method==='GET' && pathname==='/api/health')return response(res,200,await health());
   if(req.method==='GET' && pathname==='/api/data')return response(res,200,{charter:{...charter,source:undefined},backlog:{...backlog,source:undefined},roles,sources:[]});
   if(req.method==='GET' && pathname==='/api/catalog')return response(res,200,{disciplines:creativeCurriculum.disciplines,resources:creativeCurriculum.references,status:creativeCurriculum.curriculumStatus});
   if(req.method==='GET' && pathname==='/api/roadmap')return response(res,200,{version:roadmap.version,modules:roadmap.modules.map(m=>({id:m.id,name:m.name,release:m.release,priority:m.priority,goal:m.goal,implementation:statusByModule.get(m.id)||'planned'}))});
   if(req.method==='GET' && pathname==='/api/me')return response(res,200,{user:user?getUserProfile(user,user.role):null,csrf:user?.csrf||null,
     registrationOpen:cfg.signupsEnabled&&!!cfg.adoptedCode,publicMessage:'The October 2026 B.E.N. charter and operating pack are proposed until formally adopted.'});
   if(req.method==='GET' && pathname==='/api/inspiration'){
    if(limited(req,'inspiration',12))return deny(res,429,'Reference search rate limit reached.');
    const q=field(url.searchParams.get('q'),65);if(q.length<3)return response(res,200,{artworks:[],note:'Enter a subject of at least three characters.'});
    try{const artworks=await (options.inspirationSearch||findOpenArtworks)(q);return response(res,200,{artworks,note:'Reference images are for study and inspiration. Check the original artwork record.'})}
    catch{return response(res,503,{artworks:[],note:'The museum collection is currently unavailable. Browse its open access collection directly.'})}
   }
   if(pathname.startsWith('/api/') && !user)return deny(res,401,'Sign in with GitHub to use member features. Browsing and curriculum access remain public.');
   if(req.method==='POST' && pathname.startsWith('/api/')){
    const invalid=auth.checkMutation(req,user);if(invalid)return deny(res,invalid.status,invalid.error);
    if(limited(req,'write',120))return deny(res,429,'Please slow down.');
   }
   if(req.method==='POST' && pathname==='/api/logout'){auth.logout(req,res,user);return response(res,200,{ok:true})}
   if(req.method==='POST' && pathname==='/api/onboarding'){
    if(!cfg.signupsEnabled||!cfg.adoptedCode)return deny(res,403,'Founders have not activated an adopted Code and member registration.');
    const data=await bodyJSON(req);if(data.adult!==true||data.codeAccepted!==true)return deny(res,400,'Adult self-attestation and Code acceptance are required.');
    db.prepare("UPDATE users SET adult_attested=1,code_version=?,status='active' WHERE id=? AND status<>'suspended'").run(cfg.adoptedCode,user.id);
    audit(db,user.id,'accepted_code','membership',cfg.adoptedCode);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/creative/directory'){
    if(!auth.requireMember(user))return deny(res,403,'An active membership is required.');
    return response(res,200,{creatives:listCreativeProfiles(db,field(url.searchParams.get('discipline'),55),user.id)});
   }
   if(req.method==='POST' && pathname==='/api/me/creative'){
    if(!auth.requireMember(user))return deny(res,403,'An active membership is required.');
    const data=await bodyJSON(req),ids=creativeCurriculum.disciplines.map(x=>x.id);
    const selected=Array.isArray(data.disciplines)?data.disciplines.slice(0,8):[];
    if(selected.some(x=>typeof x!=='string'||!ids.includes(x)))return deny(res,400,'Choose recognized creative disciplines.');
    const tags=Array.isArray(data.tags)?data.tags.slice(0,12).map(x=>field(x,32)):[];
    if(tags.some(x=>!safeCategory(x))||!textOk(field(data.bio,450),0,450))return deny(res,400,'Invalid profile fields.');
    db.prepare('UPDATE users SET creative_bio=?,creative_disciplines=?,creative_tags=?,open_to_collab=?,open_to_mentor=? WHERE id=?')
      .run(field(data.bio,450),JSON.stringify(selected),JSON.stringify(tags),data.collaboration===true?1:0,data.mentoring===true?1:0,user.id);
    audit(db,user.id,'updated_creative_profile','user',user.id);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/me/creative/journal'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const rows=db.prepare('SELECT id,discipline_id AS disciplineId,stage,notes,reflection,created_at AS createdAt FROM creative_journal WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(user.id);
    return response(res,200,{entries:rows,note:'Only your own account can retrieve your practice notes through the API; database operators may have access. No notes are sent to GitHub or used for AI training.'});
   }
   if(req.method==='POST' && pathname==='/api/me/creative/journal'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const data=await bodyJSON(req);const d=field(data.disciplineId,60),stage=field(data.stage,20),notes=field(data.notes,1500),reflection=field(data.reflection,600);
    if(!getDiscipline(d)||!['foundations','experiment','reflection','collaboration'].includes(stage)||!textOk(notes,10,1500)||!textOk(reflection,0,600))return deny(res,400,'Select a discipline and stage, then describe your own practice.');
    if(!noContact(notes+' '+reflection))return deny(res,400,'Avoid placing personal contact information in practice notes.');
    const existing=db.prepare('SELECT count(*) AS n FROM creative_journal WHERE user_id=?').get(user.id).n;
    if(existing>=300)return deny(res,409,'Practice journal capacity reached. Export or delete older entries first.');
    const id=randomUUID();db.prepare('INSERT INTO creative_journal VALUES (?,?,?,?,?,?,?)').run(id,user.id,d,stage,notes,reflection,Date.now());
    audit(db,user.id,'created_private_practice_note','creative_journal',id);return response(res,201,{id,note:'Saved privately. B.E.N. does not claim authorship.'});
   }
   if(req.method==='POST' && /^\/api\/me\/creative\/journal\/[\w-]+\/delete$/.test(pathname)){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const id=pathname.split('/')[5];const changed=db.prepare('DELETE FROM creative_journal WHERE id=? AND user_id=?').run(id,user.id);
    if(changed.changes!==1)return deny(res,404,'Your practice note was not found.');
    audit(db,user.id,'deleted_private_practice_note','creative_journal',id);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/me/blocks'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const blocks=db.prepare('SELECT b.blocked_id AS id,u.display_name AS name FROM member_blocks b JOIN users u ON u.id=b.blocked_id WHERE b.blocker_id=? ORDER BY b.created_at DESC').all(user.id);
    return response(res,200,{blocks});
   }
   if(req.method==='POST' && pathname==='/api/me/blocks'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const data=await bodyJSON(req),target=db.prepare('SELECT id FROM users WHERE id=?').get(field(data.targetId,60));
    if(!target||target.id===user.id)return deny(res,400,'Invalid block target.');
    db.prepare('INSERT OR IGNORE INTO member_blocks VALUES (?,?,?)').run(user.id,target.id,Date.now());
    db.prepare("UPDATE connections SET status='declined',updated_at=? WHERE ((requester=? AND recipient=?) OR (requester=? AND recipient=?)) AND status='pending'").run(Date.now(),user.id,target.id,target.id,user.id);
    audit(db,user.id,'blocked_member_contact','member',target.id);return response(res,200,{ok:true,note:'Contact is blocked between these accounts. This is your own choice, not a community sanction.'});
   }
   if(req.method==='POST' && /^\/api\/me\/blocks\/[\w-]+\/remove$/.test(pathname)){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const targetId=pathname.split('/')[4],result=db.prepare('DELETE FROM member_blocks WHERE blocker_id=? AND blocked_id=?').run(user.id,targetId);
    if(result.changes!==1)return deny(res,404,'Block record not found.');
    audit(db,user.id,'unblocked_member_contact','member',targetId);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/connections'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');return response(res,200,{connections:listConnections(db,user.id)});
   }
   if(req.method==='POST' && pathname==='/api/connections'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    const data=await bodyJSON(req);const recipient=db.prepare('SELECT * FROM users WHERE id=?').get(field(data.recipientId,60));
    if(!recipient||recipient.id===user.id||recipient.status!=='active'||(!recipient.open_to_collab&&!recipient.open_to_mentor))return deny(res,400,'Creative collaborator not available for requests.');
    const blocked=db.prepare('SELECT count(*) AS n FROM member_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)').get(user.id,recipient.id,recipient.id,user.id).n;
    if(blocked>0)return deny(res,403,'This member is not available for contact.');
    const message=field(data.message,420);if(!textOk(message,12,420)||!noContact(message))return deny(res,400,'Write a short invitation without personal contact details.');
    if(db.prepare("SELECT count(*) AS n FROM connections WHERE requester=? AND recipient=? AND created_at>?").get(user.id,recipient.id,Date.now()-14*86400000).n>0)return deny(res,429,'You have already recently contacted this member.');
    const id=randomUUID(),t=Date.now();db.prepare('INSERT INTO connections (id,requester,recipient,message,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(id,user.id,recipient.id,message,t,t);
    audit(db,user.id,'creative_connection_requested','connection',id);return response(res,201,{id,status:'pending'});
   }
   if(req.method==='POST' && /^\/api\/connections\/[\w-]+\/reply$/.test(pathname)){
    const data=await bodyJSON(req);const id=pathname.split('/')[3];const c=db.prepare('SELECT * FROM connections WHERE id=? AND recipient=?').get(id,user.id);
    if(!c)return deny(res,404,'Invitation not found.');if(!['accepted','declined'].includes(data.status))return deny(res,400,'Invalid reply.');
    db.prepare("UPDATE connections SET status=?,updated_at=? WHERE id=? AND status='pending'").run(data.status,Date.now(),id);
    audit(db,user.id,'creative_connection_'+data.status,'connection',id);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/member/overview'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    return response(res,200,{stats:getDashboardStats(db),myActivities:db.prepare('SELECT id,kind,title,status FROM activities WHERE author_id=? ORDER BY created_at DESC LIMIT 10').all(user.id)});
   }
   const validKinds=new Set(['project','event','help_offer','help_request','proposal']);
   if(req.method==='GET' && pathname==='/api/activities'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');const kind=field(url.searchParams.get('kind'),25);
    if(!validKinds.has(kind))return deny(res,400,'Unknown activity type.');return response(res,200,{activities:listActivities(db,kind,user)});
   }
   if(req.method==='POST' && pathname==='/api/activities'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');const data=await bodyJSON(req);
    const kind=field(data.kind,25),title=field(data.title,120),summary=field(data.summary,1200),category=field(data.category,65)||'General';
    if(!validKinds.has(kind)||!textOk(title,5,120)||!textOk(summary,15,1200)||!safeCategory(category))return deny(res,400,'Invalid project, event or proposal details.');
    const startsAt=field(data.startsAt,50),generalLocation=field(data.generalLocation,120);
    if(startsAt && (kind!=='event'||!Number.isFinite(Date.parse(startsAt))))return deny(res,400,'A valid event date is required.');
    if(!noContact(title+' '+summary+' '+generalLocation))return deny(res,400,'Please remove personal contact information; use the private connection feature.');
    const id=createActivity(db,kind,user.id,{title,summary,category,startsAt,generalLocation});
    return response(res,201,{id,status:'proposed',note:'Submitted for human review. This is not a Board decision.'});
   }
   if(req.method==='POST' && /^\/api\/activities\/[\w-]+\/join$/.test(pathname)){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');const id=pathname.split('/')[3];const activity=db.prepare('SELECT * FROM activities WHERE id=?').get(id);
    if(!activity||activity.status!=='approved'||!['project','event'].includes(activity.kind))return deny(res,404,'Activity is not available.');
    db.prepare('INSERT OR IGNORE INTO participation (activity_id,user_id,kind,created_at) VALUES (?,?,?,?)').run(id,user.id,'join',Date.now());
    audit(db,user.id,'joined_activity','activity',id);return response(res,200,{ok:true});
   }
   if(req.method==='GET' && pathname==='/api/steward/pending'){
    if(!user.privileged)return deny(res);return response(res,200,{pending:db.prepare(`SELECT a.id,a.kind,a.title,a.summary,a.category,a.created_at,u.display_name as author_name,u.id as author_id
      FROM activities a JOIN users u ON a.author_id=u.id WHERE a.status='proposed' ORDER BY a.created_at DESC LIMIT 80`).all()});
   }
   if(req.method==='POST' && /^\/api\/steward\/activities\/[\w-]+\/review$/.test(pathname)){
    if(!user.privileged)return deny(res);const id=pathname.split('/')[4],data=await bodyJSON(req);
    if(!['approved','closed'].includes(data.status))return deny(res,400,'Invalid review outcome.');
    const target=db.prepare('SELECT * FROM activities WHERE id=?').get(id);if(!target)return deny(res,404,'Not found.');
    if(target.status!=='proposed')return deny(res,409,'This listing has already been reviewed. Use a separate change request.');
    if(target.author_id===user.id)return deny(res,403,'Please obtain a review from another steward.');
    updateActivityReview(db,id,user.id,data.status);return response(res,200,{ok:true,note:'This is a community listing review, not adoption of policy or authority to conduct an event.'});
   }
   if(req.method==='GET' && pathname==='/api/steward/launch'){
    if(!user.privileged)return deny(res);
    const notes=db.prepare('SELECT * FROM founder_updates').all();return response(res,200,{actions:backlog.actions.map(a=>({...a,update:notes.find(n=>n.action_id===a.id)||null})),stats:getDashboardStats(db),notice:'Baseline actions are proposals. A completed task does not establish a recorded vote, legal status or official safeguarding arrangement.'});
   }
   if(req.method==='POST' && pathname==='/api/steward/launch'){
    if(!user.privileged)return deny(res);const data=await bodyJSON(req);const id=field(data.actionId,12);
    if(!backlog.actions.some(x=>x.id===id))return deny(res,400,'Unknown founding action.');
    if(!['not_started','in_progress','needs_review','completed'].includes(data.state))return deny(res,400,'Invalid progress state.');
    const note=field(data.publicNote,350),evidence=field(data.evidenceRef,130),owner=field(data.ownerNote,100);
    if(!noContact(note+' '+evidence+' '+owner))return deny(res,400,'Keep personal information out of this general tracker.');
    db.prepare(`INSERT INTO founder_updates(action_id,state,public_note,evidence_ref,owner_note,updated_by,updated_at) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(action_id) DO UPDATE SET state=excluded.state,public_note=excluded.public_note,evidence_ref=excluded.evidence_ref,owner_note=excluded.owner_note,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(id,data.state,note,evidence,owner,user.id,Date.now());
    audit(db,user.id,'updated_launch_action','action',id);return response(res,200,{ok:true,notice:'Task progress is not a legal, governance or safety approval.'});
   }
   if(req.method==='GET' && pathname==='/api/steward/github/issues'){
    if(!user.privileged)return deny(res);try{return response(res,200,{issues:await github.listIssues()})}catch{return response(res,503,{error:'The GitHub App has not been configured or is unavailable.'})}
   }
   if(req.method==='POST' && pathname==='/api/steward/github/publish'){
    if(!user.privileged)return deny(res);const data=await bodyJSON(req);
    if(data.confirm!==true)return deny(res,400,'Explicit confirmation required.');
    const activity=db.prepare('SELECT * FROM activities WHERE id=?').get(field(data.proposalId,60));
    if(!activity||activity.status!=='approved'||activity.kind!=='proposal')return deny(res,400,'Only reviewed proposals can be submitted.');
    if(activity.approved_by===user.id)return deny(res,403,'A different steward must publish after review.');
    // Reserve the proposal before calling GitHub, so repeated clicks cannot create duplicate issues.
    // On timeout/unknown outcome, require manual reconciliation rather than replaying a possible write.
    const past=db.prepare('SELECT * FROM github_publications WHERE proposal_id=?').get(activity.id);
    if(past)return response(res,409,{error:past.state==='published'?'Proposal already sent to GitHub.':'GitHub publication needs steward reconciliation before retry.',publication:{state:past.state,url:past.issue_url||null,number:past.issue_number||null}});
    const t=Date.now();
    db.prepare('INSERT INTO github_publications(proposal_id,state,published_by,created_at,updated_at) VALUES (?,?,?,?,?)').run(activity.id,'pending',user.id,t,t);
    try{const issue=await github.publishProposal(activity);
     db.prepare("UPDATE github_publications SET state='published',issue_number=?,issue_url=?,updated_at=? WHERE proposal_id=?").run(issue.number,issue.url,Date.now(),activity.id);
     audit(db,user.id,'published_github_issue','proposal',activity.id);return response(res,201,{issue});}
    catch{db.prepare("UPDATE github_publications SET state='uncertain',updated_at=? WHERE proposal_id=?").run(Date.now(),activity.id);
     audit(db,user.id,'github_publication_needs_reconciliation','proposal',activity.id);
     return response(res,503,{error:'Publication could not be confirmed. The proposal is locked against duplicate sends until a steward checks GitHub manually.'});}
   }
   if(req.method==='POST' && pathname==='/api/ai/chat'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    if(limited(req,'ai',16))return deny(res,429,'AI usage limit reached for now.');
    const data=await bodyJSON(req);const result=await askAI(data);return response(res,result.status,result.data);
   }
   if(req.method==='GET' && pathname==='/api/gratitude'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');
    return response(res,200,{thanks:db.prepare(`SELECT g.id,g.message,g.created_at,u1.display_name AS sender,u2.display_name AS recipient
      FROM gratitude g JOIN users u1 ON g.sender_id=u1.id JOIN users u2 ON g.recipient_id=u2.id WHERE g.sender_id=? OR g.recipient_id=? ORDER BY g.created_at DESC LIMIT 30`).all(user.id,user.id)});
   }
   if(req.method==='POST' && pathname==='/api/gratitude'){
    if(!auth.requireMember(user))return deny(res,403,'Membership required.');const data=await bodyJSON(req);
    const recipient=db.prepare('SELECT id,status FROM users WHERE id=?').get(field(data.recipientId,60));const message=field(data.message,250);
    if(!recipient||recipient.id===user.id||recipient.status!=='active'||!textOk(message,8,250)||!noContact(message))return deny(res,400,'Please provide a valid, respectful private thank-you.');
    if(db.prepare('SELECT count(*) as n FROM gratitude WHERE sender_id=? AND recipient_id=? AND created_at>?').get(user.id,recipient.id,Date.now()-7*86400000).n>0)return deny(res,429,'A thank-you was already sent recently.');
    const id=randomUUID();db.prepare('INSERT INTO gratitude VALUES (?,?,?, ?,?)').run(id,user.id,recipient.id,message,Date.now());
    audit(db,user.id,'sent_private_gratitude','gratitude',id);return response(res,201,{id,note:'Private gratitude only. There are no points, rankings or voting privileges.'});
   }
   if(req.method==='GET' && pathname==='/api/privacy/export'){
    const own=db.prepare('SELECT id,github_id,github_login,display_name,status,code_version,adult_attested,creative_bio,creative_disciplines,creative_tags,open_to_collab,open_to_mentor FROM users WHERE id=?').get(user.id);
    const mine=db.prepare('SELECT id,kind,title,summary,category,status,created_at FROM activities WHERE author_id=?').all(user.id);
    const journal=db.prepare('SELECT id,discipline_id,stage,notes,reflection,created_at FROM creative_journal WHERE user_id=? ORDER BY created_at DESC').all(user.id);
    const blocks=db.prepare('SELECT blocked_id,created_at FROM member_blocks WHERE blocker_id=?').all(user.id);
    return response(res,200,{exportedAt:new Date().toISOString(),profile:own,createdActivities:mine,creativeJournal:journal,blockedMembers:blocks,connections:listConnections(db,user.id),
      note:'Personal data export for this prototype. Separate legal, safety or financial systems have their own subject-access processes.'});
   }
   if(req.method==='POST' && pathname==='/api/privacy/deactivate'){
    if(user.privileged)return deny(res,403,'Stewards must complete a secure role handover before self-deactivation.');
    db.prepare("UPDATE users SET status='pending',creative_bio='',creative_disciplines='[]',creative_tags='[]',open_to_collab=0,open_to_mentor=0 WHERE id=?").run(user.id);
    db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
    audit(db,user.id,'requested_account_deactivation','user',user.id);auth.logout(req,res,user);
    return response(res,200,{ok:true,note:'Account deactivated and profile removed from discovery. A complete deletion process requires separate review of records and legal obligations.'});
   }
   if(pathname.startsWith('/api/'))return deny(res,404,'Unknown API endpoint.');
   if(req.method!=='GET'&&req.method!=='HEAD')return deny(res,405,'Method not allowed.');
   let decoded;try{decoded=decodeURIComponent(pathname)}catch{return deny(res,400,'Invalid path.');}
   if(decoded.includes('\0')||decoded.split('/').includes('..'))return deny(res,404,'Not found.');
   const file=path.resolve(publicDir,'.'+(decoded==='/'?'/index.html':decoded));
   if(!file.startsWith(publicDir+path.sep)||!mime[path.extname(file)])return deny(res,404,'Not found.');
   try{const bytes=await readFile(file);res.writeHead(200,headers(mime[path.extname(file)]));res.end(req.method==='HEAD'?undefined:bytes)}catch{return deny(res,404,'Not found.');}
  }catch(e){
   if(e?.message==='too-large'||e?.message==='bad-json')return deny(res,400,'Invalid or oversized JSON request.');
   logError(e);if(!res.headersSent)return deny(res,500,'Unable to complete this request.');
  }
 });
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const cfg=authConfig();
 const { execFileSync }=await import('node:child_process');
 execFileSync(process.execPath,[path.join(root,'scripts/build-site.mjs')],{stdio:'inherit'});
 createServer({config:cfg}).listen(cfg.port,cfg.host,()=>console.log(`B.E.N. OS: ${cfg.baseUrl} (local development; do not expose before production review)`));
}
