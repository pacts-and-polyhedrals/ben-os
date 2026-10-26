import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
export function createGitHubBridge(env=process.env,fetcher=fetch){
 const appId=String(env.BEN_GITHUB_APP_ID||'');const installation=String(env.BEN_GITHUB_INSTALLATION_ID||'');
 const keyPath=env.BEN_GITHUB_PRIVATE_KEY_PATH||'';const repo=String(env.BEN_GITHUB_REPOSITORY||'');
 let cached=null;
 const validRepo=/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(repo);
 const configured=!!(appId&&installation&&keyPath&&validRepo);
 async function token(){
  if(!configured)throw Error('GitHub App integration is not configured');
  if(cached && Date.now()<cached.expires-120000)return cached.value;
  const key=readFileSync(keyPath,'utf8');const iat=Math.floor(Date.now()/1000)-60;
  const payload=base64({iat,exp:iat+540,iss:appId});
  const header=base64({alg:'RS256',typ:'JWT'});
  const unsigned=`${header}.${payload}`;const signer=createSign('RSA-SHA256');signer.update(unsigned);signer.end();
  const jwt=unsigned+'.'+signer.sign(key,'base64url');
  const r=await fetcher(`https://api.github.com/app/installations/${encodeURIComponent(installation)}/access_tokens`,{
   method:'POST',headers:{authorization:`Bearer ${jwt}`,accept:'application/vnd.github+json','user-agent':'BEN-OS'},
   body:JSON.stringify({permissions:{issues:'write',metadata:'read'}})});
  if(!r.ok)throw Error(`GitHub App installation token request failed (${r.status})`);
  const j=await r.json();if(!j.token||!j.expires_at)throw Error('GitHub App token missing');cached={value:j.token,expires:new Date(j.expires_at).getTime()};return cached.value;
 }
 async function call(method,path,body){
  const access=await token();const r=await fetcher(`https://api.github.com/repos/${repo}/${path}`,{
   method,headers:{authorization:`Bearer ${access}`,accept:'application/vnd.github+json','content-type':'application/json','user-agent':'BEN-OS'},
   ...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error(`GitHub ${method} failed (${r.status})`);return r.json();
 }
 function status(){return {configured,repository:configured?repo:null,mode:'GitHub App installation; no member repository permissions'};}
 async function listIssues(){return (await call('GET','issues?state=open&per_page=35')).filter(x=>!x.pull_request).map(x=>({number:x.number,title:x.title,url:x.html_url,state:x.state,updatedAt:x.updated_at}));}
 async function publishProposal(activity){
  if(activity.kind!=='proposal'||activity.status!=='approved')throw Error('Only approved non-sensitive proposals can be published');
  const text=`${activity.title}\n${activity.summary}`;
  if(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\b(?:\+?\d[\d\s()-]{8,}\d)\b/i.test(text))throw Error('Proposal appears to contain contact details; redact before publishing');
  const body=`Community proposal reference: ${activity.id}\n\n${activity.summary}\n\n---\nThis is a non-sensitive community proposal shared by an authorised B.E.N. steward. It is NOT a Board resolution, policy adoption, or grant of authority. Review and act under approved B.E.N. rules.`;
  const issue=await call('POST','issues',{title:`[Community proposal] ${activity.title}`,body});
  return {number:issue.number,url:issue.html_url,title:issue.title};
 }
 return {status,listIssues,publishProposal};
}
function base64(data){return Buffer.from(JSON.stringify(data)).toString('base64url');}
