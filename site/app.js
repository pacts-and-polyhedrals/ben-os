const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const state={charter:null,actions:null,roles:null,catalog:null,roadmap:[],publicBuild:null,user:null,csrf:null,online:false,registrationOpen:false,selection:null,history:[],launch:[],pending:[],connections:[],targetConnection:null};
const htmlEscape=()=>{}; // User content is always added with textContent, not interpolated into markup.
function el(tag,cls='',value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;}
function add(parent,...children){children.filter(Boolean).forEach(c=>parent.append(c));return parent;}
function appendText(parent,text,tag='p',cls=''){return add(parent,el(tag,cls,text));}
function option(value,label){const e=el('option','',label);e.value=value;return e;}
function button(text,cls='button button-outline',onClick){const b=el('button',cls,text);b.type='button';if(onClick)b.addEventListener('click',onClick);return b;}
function warn(message){const e=$('#notice');e.textContent=message;e.classList.remove('hidden');e.scrollIntoView({behavior:'smooth',block:'start'});}
function clearNotice(){$('#notice').textContent='';$('#notice').classList.add('hidden');}
function activeMember(){return !!(state.user&&(state.user.status==='active'||['founder','steward'].includes(state.user.role)))}
function isSteward(){return !!state.user&&['founder','steward'].includes(state.user.role)}
function dateTime(x){if(!x)return '';const d=new Date(x);return isNaN(d)?'':new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(d);}
function show(view){
 clearNotice();
 if(!$('#view-'+view))view='home';
 if(['people','projects','help','events','proposals','assistant','profile'].includes(view)&&!activeMember()){
  warn('Member features need an active B.E.N. account. You can still explore the creative library and principles.');view='home';
 }
 if(view==='founders'&&!isSteward()){warn('Only explicitly authorised stewards can open the founder console.');view='home';}
 $$('.view').forEach(e=>e.classList.toggle('active',e.id==='view-'+view));
 $$('.nav').forEach(e=>e.classList.toggle('active',e.dataset.view===view));
 history.replaceState({},'',`#${view}`);window.scrollTo({top:0,behavior:'instant'});
 if(view==='people')loadPeople();if(['projects','help','events','proposals'].includes(view))loadCommunities(view);
 if(view==='founders')loadFounder();if(view==='profile')loadPersonal();if(view==='creative'&&activeMember())loadCreativeJournal();
}
async function getJSON(url){const r=await fetch(url,{cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Request could not be completed.');return j;}
async function postJSON(url,data){const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-ben-csrf':state.csrf||''},credentials:'same-origin',body:JSON.stringify(data)});
 const j=await r.json().catch(()=>({error:'Invalid server response'}));if(!r.ok)throw Error(j.error||'Request failed');return j;}
async function loadSite(){
 const fallback=async(filename)=>getJSON('./data/'+filename+'.json');
 const [charter,actions,roles,catalog]=await Promise.all([fallback('charter'),fallback('launch-actions'),fallback('roles'),fallback('creative-curriculum')]);
 state.charter=charter;state.actions=actions;state.roles=roles;state.catalog=catalog;
 try{const [health,me,roadmap]=await Promise.all([getJSON('./api/health'),getJSON('./api/me'),getJSON('./api/roadmap')]);
  state.online=true;state.user=me.user;state.csrf=me.csrf;state.registrationOpen=me.registrationOpen;state.roadmap=roadmap.modules;
  $('#platform-state').textContent=health.loginConfigured?'App connected':'App needs configuration';
  $('#platform-state').title=health.modelConnected?'AI model connected':'AI model can be configured separately';
  if(!health.loginConfigured)$('#sign-in').title='Founders must register a GitHub App first';
 }catch{state.online=false;$('#platform-state').textContent='Static project preview';}
 try{if(!state.roadmap.length){
  const d=await fallback('roadmap-modules'),status=await fallback('module-delivery-status');
  const stages=new Map(status.modules.map(s=>[s.id,s]));
  state.roadmap=d.modules.map(x=>{
   const m=stages.get(x.id)||{};
   return {id:x.id,name:x.name,release:x.release,priority:x.priority,goal:x.goal,
    implementation:m.stage||'planned',operationalMilestone:m.operationalMilestone||'',
    whatExists:m.whatExists||'',remainingGates:m.remainingGates||[],lastEvidenceReview:m.lastEvidenceReview||''};
  });
 }}catch{}
 // Public GitHub Pages reads only a minimal, non-sensitive status endpoint.
 // Founder authentication and full member data remain on the Cloudflare origin.
 if(location.hostname==='pacts-and-polyhedrals.github.io'){
  try{const v=await getJSON('https://ben-os-staging.selvagrow7.workers.dev/api/public-build-status');
   if(v.service==='B.E.N. public build status'&&v.runtime?.environment==='founder-staging')state.publicBuild=v;
  }catch{state.publicBuild=null;}
 }
 renderAuth();renderPrinciples();renderCreativeCatalog();renderRoadmap();installForms();
 const hash=location.hash.replace('#','');show(['home','creative','people','projects','help','events','proposals','assistant','profile','principles','ethics','roadmap','founders'].includes(hash)?hash:'home');
 const authCode=new URLSearchParams(location.search).get('auth');if(authCode){warn({'invalid-state':'Sign-in validation failed. Please try again.','not-configured':'A founder needs to configure the GitHub App first.','failed':'GitHub sign-in did not complete.'}[authCode]||'Sign-in information is unavailable.');}
}
function renderAuth(){
 const user=state.user;const ready=state.online;
 $('#sign-in').classList.toggle('hidden',!!user||!ready);
 $('#sign-out').classList.toggle('hidden',!user);
 $('#user-chip').classList.toggle('hidden',!user);if(user)$('#user-chip').textContent=`${user.name} · ${user.role}`;
 $('#steward-nav').classList.toggle('hidden',!isSteward());
 $$('.member-only').forEach(n=>n.classList.toggle('hidden',!activeMember()));
 $('#journal-section').classList.toggle('hidden',!activeMember());
 if(!state.online){$('#welcome-title').textContent='Project preview';$('#welcome-copy').textContent='This is a public preview, not a logged-in member portal. A separate Cloudflare founder staging login and D1 task board are operational. Public membership is closed pending safeguards.';return;}
 if(!user){$('#welcome-title').textContent='Explore, then join when ready';$('#welcome-copy').textContent='Sign in with GitHub to identify yourself to the B.E.N. app. You will not get access to edit the GitHub repository. Member registration opens only after the founders have adopted the required controls.';return;}
 if(activeMember()){
  $('#welcome-title').textContent=`Welcome back, ${user.name}`;
  $('#welcome-copy').textContent='Your member portal is ready. Human decisions remain with the people authorised to make them.';
  loadMemberOverview();return;
 }
 $('#welcome-title').textContent='Your registration is pending';
 $('#welcome-copy').textContent=state.registrationOpen?'Confirm the adult-only baseline and adopted Code to activate your membership.':'The founders have not yet approved and opened member registration. Your GitHub sign-in has not granted repository or member privileges.';
 $('#onboard-section').classList.toggle('hidden',!state.registrationOpen);
}
function renderPrinciples(){const target=$('#principles-grid');target.replaceChildren();for(const principle of state.charter.principles){const card=el('article','principle-card');add(card,el('span','card-num',String(principle.id).padStart(2,'0')),el('h3','',principle.title),el('p','',principle.subtitle),el('p','',principle.text));target.append(card);}
 const t=$('#ben-test');t.replaceChildren();state.charter.benTest.forEach((question,i)=>{const row=el('div','test-row'),label=el('span','',question),select=el('select','input');select.dataset.test=i;
 [['','Needs reflection'],['yes','Yes'],['no','No'],['needs-work','Needs work']].forEach(([v,n])=>select.append(option(v,n)));add(row,label,select);t.append(row);});}
function renderCreativeCatalog(){
 const catalog=state.catalog;const groups=[...new Set(catalog.disciplines.map(x=>x.group))].sort();const groupSelect=$('#discipline-group');groups.forEach(n=>groupSelect.append(option(n,n)));
 const lists=['#people-discipline','#profile-disciplines','#ai-discipline'];for(const selector of lists){const target=$(selector);catalog.disciplines.forEach(d=>target.append(option(d.id,d.name)));}
 function renderList(){const q=$('#discipline-search').value.toLowerCase(),g=groupSelect.value,box=$('#disciplines-list');box.replaceChildren();
  for(const d of catalog.disciplines.filter(x=>(g==='all'||x.group===g) && (x.name.toLowerCase().includes(q)||x.techniques.some(t=>t.includes(q))))){
   const b=el('button','discipline-button'+(d.id===state.selection?' active':''),d.name);b.type='button';b.addEventListener('click',()=>selectDiscipline(d.id));box.append(b);
  }if(!box.childElementCount)appendText(box,'No matching disciplines. Try a broader term.');
 }
 $('#discipline-search').addEventListener('input',renderList);groupSelect.addEventListener('change',renderList);renderList();
 selectDiscipline('painting');
}
function selectDiscipline(id){state.selection=id;const d=state.catalog.disciplines.find(x=>x.id===id);if(!d)return;
 $$('.discipline-button').forEach(b=>b.classList.toggle('active',b.textContent===d.name));const target=$('#creative-detail');target.replaceChildren();
 appendText(target,d.group.toUpperCase(),'p','eyebrow');appendText(target,d.name,'h2');appendText(target,'Learn a technique. Try something. Keep what makes the work yours.');
 const tags=el('div','techniques');d.techniques.forEach(t=>tags.append(el('span','tag',t)));target.append(tags);
 for(const [name,content] of [['A first experiment',d.starterExercise],['Stretch your creative practice',d.advancedChallenge]]){
  const box=el('div','lesson-card');add(box,el('strong','',name),el('p','',content));target.append(box);
 }
 renderLearningPath(d);$('#journal-selection').textContent=`Current discipline: ${d.name}. These notes will be private.`;
 appendText(target,'Questions to ask as you work:','strong');for(const q of d.feedbackQuestions)appendText(target,'• '+q,'p','muted');
 const actions=el('div','coach-actions');for(const [mode,label] of [['explore','Explore an idea'],['practice','Practise technique'],['critique','Get critique'],['collaborate','Plan collaboration']]){
  actions.append(button(label,'button button-outline',()=>{if(!activeMember()){warn('Sign in as an active member to talk to B.E.N.; the exercises and references remain free to browse.');return;}
   $('#ai-discipline').value=id;$('#ai-mode').value=mode;show('assistant');}));}
 target.append(actions);
 const refs=$('#reference-links');refs.replaceChildren();const matches=state.catalog.references.filter(r=>r.suitable.includes(id));
 if(matches.length){appendText(refs,'Reference collections to explore','strong');for(const r of matches){const a=el('a','',`${r.name} ↗`);a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.title=r.note;refs.append(a)}}
}
function renderLearningPath(d){
 const box=$('#creative-path');box.replaceChildren();const stages=[
  ['01 · Foundations',`Study ${d.techniques[0]}; look for one example by a human creator and notice a detail you would like to understand.`, 'foundations'],
  ['02 · Experiment',d.starterExercise, 'experiment'],
  ['03 · Reflect',`Return to your own work. ${d.feedbackQuestions[0]} Keep the choices you value and identify one possible revision.`, 'reflection'],
  ['04 · Collaborate',`Invite a consenting person to share feedback or a joint exercise in ${d.name}. Give fair credit and agree on boundaries.`, 'collaboration']
 ];
 for(const [heading,copy,stage] of stages){const card=el('article','path-stage');add(card,el('strong','',heading),el('p','',copy));card.append(button('Use this stage','mini-button',()=>{if(!activeMember()){warn('Sign in to save practice notes; learning prompts remain public.');return;}$('#journal-stage').value=stage;$('#journal-notes').focus();}));box.append(card)}
}
async function loadCreativeJournal(){if(!activeMember())return;const list=$('#journal-entries');list.replaceChildren();try{
 const result=await getJSON('./api/me/creative/journal');if(!result.entries.length){appendText(list,'Your notes will appear here after your first exercise. No scores or public progress rankings.');return;}
 for(const entry of result.entries){const card=el('div','mini-row'),discipline=state.catalog.disciplines.find(x=>x.id===entry.disciplineId);
  add(card,el('strong','',`${discipline?.name||entry.disciplineId} · ${entry.stage} · ${new Date(entry.createdAt).toLocaleDateString()}`),el('p','',entry.notes));
  if(entry.reflection)appendText(card,'Next: '+entry.reflection,'p','muted');
  card.append(button('Delete note','mini-button',async()=>{if(!confirm('Permanently delete this private practice note?'))return;
   try{await postJSON(`./api/me/creative/journal/${entry.id}/delete`,{});await loadCreativeJournal()}catch(e){warn(e.message)} }));list.append(card);
 }
 }catch(e){appendText(list,e.message)}
}
async function saveCreativeJournal(event){event.preventDefault();if(!activeMember())return;try{
 const disciplineId=state.selection;if(!disciplineId)throw Error('Select a discipline first.');
 await postJSON('./api/me/creative/journal',{disciplineId,stage:$('#journal-stage').value,notes:$('#journal-notes').value,reflection:$('#journal-reflection').value});
 $('#journal-notes').value='';$('#journal-reflection').value='';warn('Your private practice note was saved. You retain authorship.');await loadCreativeJournal();
 }catch(e){warn(e.message)}
}
function renderRoadmap(){
 const releases=[...new Set(state.roadmap.map(x=>x.release))].sort();releases.forEach(r=>$('#roadmap-release').append(option(r,r)));
 const render=()=>{const q=$('#roadmap-search').value.toLowerCase(),release=$('#roadmap-release').value,tar=$('#roadmap-list');tar.replaceChildren();
  for(const item of state.roadmap.filter(x=>(release==='all'||release===x.release)&&[x.id,x.name,x.goal].join(' ').toLowerCase().includes(q))){const row=el('article','roadmap-row');
   const info=el('div');add(info,el('h3','',item.name),el('p','',item.goal));
   const live=state.publicBuild?.runtime||{};
   const verifiedLive=(item.id==='P02'&&live.databaseConnected===true)||
    (item.id==='P03'&&live.githubLoginConfigured===true)||
    (item.id==='P04'&&live.founderWorkspaceReady===true);
   let label=item.implementation==='verified_complete'?'Independently verified complete':
    item.implementation==='planned'?'Planned, not yet built':'Prototype slice — incomplete';
   if(item.operationalMilestone&&item.implementation==='prototype_partial'){
    label=verifiedLive?'Staging online now — release gates remain':
     'Milestone evidenced — release gates remain';
   }
   add(info,el('span','release-state',label));
   if(item.whatExists&&/^P0[1-6]$/.test(item.id)){
    add(info,el('p','roadmap-evidence',item.whatExists));
    if(item.remainingGates?.length)appendText(info,'Still required: '+item.remainingGates.join(' • '),'p','roadmap-remains');
    if(item.lastEvidenceReview)appendText(info,'Evidence reviewed: '+item.lastEvidenceReview+(verifiedLive?' · Live staging probe passed':''),'p','roadmap-reviewed');
   }
   add(row,el('strong','',item.id),info,el('small','',item.release));tar.append(row);}
 };$('#roadmap-search').addEventListener('input',render);$('#roadmap-release').addEventListener('change',render);render();}
function installForms(){
 $$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
 $$('.nav').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
 $('#sign-out').addEventListener('click',async()=>{try{await postJSON('./api/logout',{});location.href='./'}catch(e){warn(e.message)}});
 $('#onboard-button').addEventListener('click',async()=>{try{await postJSON('./api/onboarding',{adult:$('#adult-check').checked,codeAccepted:$('#code-check').checked});await refreshMe();show('home')}catch(e){warn(e.message)}});
 $('#copy-test').addEventListener('click',async()=>{const lines=state.charter.benTest.map((q,i)=>`${i+1}. ${q} — ${$(`[data-test="${i}"]`).selectedOptions[0].text}`);await navigator.clipboard.writeText(`B.E.N. Test · personal reflection (not a vote)\n${lines.join('\n')}`);warn('B.E.N. reflection copied. It is not a formal vote.')});
 $('#find-inspiration').addEventListener('click',loadInspiration);$('#inspiration-query').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loadInspiration()}});
 $('#refresh-people').addEventListener('click',loadPeople);
 $('#journal-form').addEventListener('submit',saveCreativeJournal);
 $('#creative-profile').addEventListener('submit',saveCreativeProfile);$('#export-data').addEventListener('click',exportData);$('#deactivate').addEventListener('click',deactivate);
 $('#chat-form').addEventListener('submit',sendChat);
 $('#refresh-issues').addEventListener('click',loadIssues);$('#founder-search').addEventListener('input',renderFounderActions);$('#founder-state').addEventListener('change',renderFounderActions);
 $('#roadmap-search').value='';
 for(const node of $$('.new-activity'))setupActivityForm(node);
 $('#send-connection').addEventListener('click',async e=>{e.preventDefault();try{const id=state.targetConnection;await postJSON('./api/connections',{recipientId:id,message:$('#connection-message').value});$('#connection-dialog').close();warn('Your invitation was sent privately. The other member can accept or decline.');loadConnections()}catch(err){warn(err.message)}});
 window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
}
async function refreshMe(){const me=await getJSON('./api/me');state.user=me.user;state.csrf=me.csrf;state.registrationOpen=me.registrationOpen;renderAuth()}
async function loadMemberOverview(){try{const data=await getJSON('./api/member/overview');const m=$('#home-stats');m.replaceChildren();
 for(const [key,val] of [['Active members',data.stats.members],['Projects approved',data.stats.approvedProjects],['Creative volunteers',data.stats.activeCreatives],['Proposals under review',data.stats.proposed]]){
  const x=el('div','metric');add(x,el('strong','',val),el('span','',key));m.append(x);}m.classList.remove('hidden');}catch{}}
function setupActivityForm(wrapper){const kind=wrapper.dataset.kind;const title={project:'Propose a community project',event:'Suggest a gathering',help_offer:'Offer help',help_request:'Ask for help',proposal:'Propose an improvement'}[kind];
 const open=button('+ '+title,'button button-outline',()=>form.classList.toggle('hidden'));wrapper.append(open);
 const form=el('form','new-item-form hidden');const group=el('div','form-group');
 const label=(txt,elem)=>{const l=el('label','',txt);l.append(elem);return l};
 const titleEl=el('input','input'),category=el('input','input'),summary=el('textarea','input'),date=el('input','input'),generalLocation=el('input','input');
 titleEl.maxLength=120;titleEl.placeholder='A clear, inviting title';category.maxLength=65;category.value='General';summary.rows=4;summary.maxLength=1200;summary.placeholder='Describe the need, idea and how other people could help. Do not include private contact information.';
 date.type='datetime-local';generalLocation.placeholder='Online or broad area only; no private addresses.';
 add(group,label('Title',titleEl),label('Category',category));add(form,group,label('Purpose and details',summary));if(kind==='event'){add(form,label('Date and time (optional)',date),label('General location',generalLocation))}
 const submit=button('Submit for review','button button-gold');submit.type='submit';form.append(submit);form.addEventListener('submit',async e=>{e.preventDefault();try{
  const data={kind,title:titleEl.value,summary:summary.value,category:category.value};if(kind==='event'){data.startsAt=date.value?new Date(date.value).toISOString():'';data.generalLocation=generalLocation.value}
  await postJSON('./api/activities',data);warn('Proposal recorded. A separate human reviewer must approve it before general publication.');form.reset();form.classList.add('hidden');loadCommunities(kind==='help_offer'||kind==='help_request'?'help':kind==='project'?'projects':kind==='event'?'events':'proposals');
 }catch(e2){warn(e2.message)}});wrapper.append(form);}
async function loadCommunities(view){if(!activeMember())return;
 const map={projects:['project'],help:['help_offer','help_request'],events:['event'],proposals:['proposal']};for(const kind of (map[view]||[])){
  const target=$(`#${kind==='project'?'projects':kind==='event'?'events':kind==='proposal'?'proposals':kind}-list`);if(!target)continue;target.replaceChildren();
  try{const data=await getJSON('./api/activities?kind='+kind);if(!data.activities.length){appendText(target,'No public listings yet. You can propose the first one.');continue;}
   for(const item of data.activities){const card=el('article','activity-card');add(card,el('div','card-meta',item.status.toUpperCase()+' · '+item.category),el('h3','',item.title),el('p','',item.summary));
    const footer=el('div','card-footer');footer.append(el('span','muted','By '+item.authorName));
    if(item.startsAt)footer.append(el('span','muted',dateTime(item.startsAt)));if(item.status==='approved'&&['project','event'].includes(kind))footer.append(button('Join','mini-button',async()=>{
      try{await postJSON(`./api/activities/${item.id}/join`,{});warn('You have joined. The organisers will provide approved logistics through the app.')}catch(e){warn(e.message)}
    }));card.append(footer);target.append(card)}
  }catch(e){appendText(target,e.message,'p','muted')}
 }
}
async function loadPeople(){if(!activeMember())return;const target=$('#people-results');target.replaceChildren();try{
 const dis=$('#people-discipline').value;const r=await getJSON('./api/creative/directory'+(dis?'?discipline='+encodeURIComponent(dis):''));
 if(!r.creatives.length){appendText(target,'Nobody has opted into this creative directory yet. You could be the first.');return;}
 for(const u of r.creatives){const card=el('article','person-card');add(card,el('div','card-meta',u.mentoring?'SKILLS TO SHARE':'OPEN TO COLLABORATE'),el('h3','',u.name),el('p','',u.bio||'Open to creative connections.'));
  const tags=el('div','techniques');u.disciplines.slice(0,4).forEach(id=>tags.append(el('span','tag',state.catalog.disciplines.find(d=>d.id===id)?.name||id)));card.append(tags);
  if(u.id!==state.user.id){
   card.append(button('Ask to connect','mini-button',()=>{state.targetConnection=u.id;$('#connection-target').textContent=`To ${u.name}: tell them what you'd like to explore together.`;$('#connection-message').value='';$('#connection-dialog').showModal()}));
   card.append(button('Block contact','mini-button',async()=>{if(!confirm(`Stop contact and hide ${u.name} from your creative directory? You can reverse this later.`))return;
     try{await postJSON('./api/me/blocks',{targetId:u.id});warn('Contact blocked. This is a personal boundary, not a community sanction.');loadPeople()}catch(e){warn(e.message)}}));
  }target.append(card);
 }
 }catch(e){appendText(target,e.message)}loadConnections();}
async function loadConnections(){const target=$('#connections-list');target.replaceChildren();try{const result=await getJSON('./api/connections');
 if(!result.connections.length){appendText(target,'No invitations yet. You control which requests you accept.');return;}
 for(const c of result.connections){const row=el('div','mini-row');add(row,el('strong','',`${c.requesterName} → ${c.recipientName} · ${c.status}`),el('p','',c.message));
  if(c.recipientId===state.user.id&&c.status==='pending')for(const [label,status] of [['Accept','accepted'],['Decline','declined']])row.append(button(label,'mini-button',async()=>{try{await postJSON(`./api/connections/${c.id}/reply`,{status});loadConnections()}catch(e){warn(e.message)}}));
  target.append(row)
 }
 }catch(e){appendText(target,e.message)}}
async function loadInspiration(){const target=$('#inspiration-results');target.replaceChildren();const term=$('#inspiration-query').value.trim();if(term.length<3){warn('Enter a subject with at least three characters.');return;}
 appendText(target,'Searching the museum’s public-domain collection…');try{const data=await getJSON('./api/inspiration?q='+encodeURIComponent(term));target.replaceChildren();
 if(!data.artworks.length){appendText(target,data.note||'No matching public-domain images were found.');return;}
 for(const a of data.artworks){const card=el('article','artwork'),im=el('img');im.src=a.imageUrl;im.alt=`${a.title}, by ${a.artist}`;im.loading='lazy';const link=el('a','',a.title);link.href=a.objectUrl;link.target='_blank';link.rel='noopener noreferrer';
  add(link,el('small','',`${a.artist} · ${a.date}`),el('small','',a.license));add(card,im,link);target.append(card)}
 }catch(e){target.replaceChildren();appendText(target,'Reference search is unavailable. Visit The Met Open Access collection using the link above.');}}
async function saveCreativeProfile(e){e.preventDefault();const selected=[...$('#profile-disciplines').selectedOptions].map(x=>x.value);if(selected.length>8){warn('Please select no more than eight disciplines.');return;}
 const data={bio:$('#profile-bio').value,disciplines:selected,tags:$('#profile-tags').value.split(',').map(x=>x.trim()).filter(Boolean),collaboration:$('#opt-collab').checked,mentoring:$('#opt-mentor').checked};
 try{await postJSON('./api/me/creative',data);warn('Your sharing choices were saved. You can change or turn them off at any time.');await refreshMe()}catch(err){warn(err.message)}}
async function loadPersonal(){if(!activeMember())return;const u=state.user;
 $('#profile-bio').value=u.creativeBio||'';$('#profile-tags').value=(u.creativeTags||[]).join(', ');$('#opt-collab').checked=u.openToCollab;$('#opt-mentor').checked=u.openToMentor;
 for(const o of $('#profile-disciplines').options)o.selected=(u.creativeDisciplines||[]).includes(o.value);
 const target=$('#gratitude-list');target.replaceChildren();try{const data=await getJSON('./api/gratitude');if(!data.thanks.length){appendText(target,'No thank-you notes yet. Appreciation is private—not a leaderboard.');return;}
  data.thanks.forEach(x=>{const row=el('div','mini-row');add(row,el('strong','',`${x.sender} to ${x.recipient}`),el('p','',x.message));target.append(row)});
 }catch(e){appendText(target,e.message)}
}
async function exportData(){try{const data=await getJSON('./api/privacy/export');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);
 const a=el('a');a.href=u;a.download='BEN_my_data.json';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u)}catch(e){warn(e.message)}}
async function deactivate(){if(!confirm('Deactivate your B.E.N. membership and stop appearing in creative discovery? Some records may require a separate lawful deletion review.'))return;
 try{await postJSON('./api/privacy/deactivate',{});location.href='./'}catch(e){warn(e.message)}}
function chatBubble(role,message){const box=el('div','chat-bubble '+(role==='user'?'user-bubble':'ben-bubble'));add(box,el('strong','',role==='user'?'You':'B.E.N.'),el('p','',message));$('#chat-log').append(box);$('#chat-log').scrollTop=$('#chat-log').scrollHeight;}
async function sendChat(event){event.preventDefault();const message=$('#chat-message').value.trim();if(!message)return;$('#chat-message').value='';chatBubble('user',message);
 try{const reply=await postJSON('./api/ai/chat',{message,discipline:$('#ai-discipline').value,mode:$('#ai-mode').value,goal:$('#ai-goal').value,history:state.history.slice(-6)});
 chatBubble('assistant',reply.reply);state.history.push({role:'user',content:message},{role:'assistant',content:reply.reply});if(state.history.length>8)state.history=state.history.slice(-8);
 $('#chat-sources').textContent=(reply.sources||[]).map(x=>`${x.id} — ${x.title} (${x.status})`).join(' • ')||'Creative coaching responses rely on the selected curriculum and are not formal expert certifications.';
 }catch(e){chatBubble('assistant',e.message);}}
async function loadFounder(){if(!isSteward())return;try{const [launch,pending]=await Promise.all([getJSON('./api/steward/launch'),getJSON('./api/steward/pending')]);
 state.launch=launch.actions;state.pending=pending.pending;renderFounderStats(launch.stats);renderFounderActions();renderPending();loadIssues();}catch(e){warn(e.message)}}
function renderFounderStats(stats){const box=$('#founder-metrics');box.replaceChildren();for(const [label,value] of [['Unreviewed proposals',stats.proposed],['Active members',stats.members],['Approved projects',stats.approvedProjects],['Creative volunteers',stats.activeCreatives]]){
 const card=el('div','metric');add(card,el('strong','',value),el('span','',label));box.append(card)}}
function renderFounderActions(){const q=$('#founder-search').value.toLowerCase(),s=$('#founder-state').value,tar=$('#founder-actions');tar.replaceChildren();
 for(const action of state.launch.filter(a=>[a.id,a.title,a.nextStep].join(' ').toLowerCase().includes(q)&&(s==='all'||(a.update?.state||'not_started')===s))){const card=el('article','task-card'),head=el('div');
 add(head,el('h3','',`${action.id} · ${action.title}`),el('small','',action.priority.toUpperCase()));card.append(head);appendText(card,action.nextStep);
 const form=el('form','form-row'),status=el('select','input'),note=el('input','input'),evidence=el('input','input'),save=el('button','button button-outline','Save');save.type='submit';
 for(const [v,n] of [['not_started','Not started'],['in_progress','In progress'],['needs_review','Needs review'],['completed','Completed*']])status.append(option(v,n));
 status.value=action.update?.state||'not_started';note.value=action.update?.public_note||'';note.placeholder='Public progress note';note.maxLength=350;evidence.value=action.update?.evidence_ref||'';evidence.placeholder='Non-sensitive evidence ID';evidence.maxLength=130;
 add(form,status,note,evidence,save);form.addEventListener('submit',async ev=>{ev.preventDefault();try{await postJSON('./api/steward/launch',{actionId:action.id,state:status.value,publicNote:note.value,evidenceRef:evidence.value,ownerNote:''});warn('Progress saved. This does not establish a formal governance approval.');loadFounder()}catch(e){warn(e.message)}});
 card.append(form);tar.append(card);
 }
}
function renderPending(){const box=$('#pending-list');box.replaceChildren();if(!state.pending.length){appendText(box,'No proposals are awaiting listing review.');return;}
 for(const x of state.pending){const card=el('div','mini-row');add(card,el('strong','',`${x.kind.toUpperCase()} · ${x.title}`),el('p','',x.summary),el('p','',`By ${x.author_name}`));
 if(x.author_id!==state.user.id){const row=el('div','form-row');for(const [label,status] of [['Approve listing','approved'],['Close','closed']])row.append(button(label,'mini-button',async()=>{
  if(!confirm(`${label} for this community listing? This is NOT approval of an event, policy, budget or official position.`))return;
  try{await postJSON(`./api/steward/activities/${x.id}/review`,{status});loadFounder()}catch(e){warn(e.message)}
 }));card.append(row)}box.append(card)}
}
async function loadIssues(){const box=$('#github-issues');box.replaceChildren();try{const data=await getJSON('./api/steward/github/issues');if(!data.issues.length){appendText(box,'No open development issues in the selected repository.');return;}
 for(const x of data.issues.slice(0,12)){const row=el('div','mini-row');const a=el('a','',`#${x.number} ${x.title}`);a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';row.append(a);box.append(row)}
 }catch(e){appendText(box,'GitHub issue sync is not configured yet. The source code and this portal use separate permissions.','p','muted')}}
loadSite().catch(()=>{const e=$('#notice');e.classList.remove('hidden');e.textContent='The static build files could not be loaded. Run npm run build:site and reload.';});
