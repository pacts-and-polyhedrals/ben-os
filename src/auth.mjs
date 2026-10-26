import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createLoginState, consumeLoginState, digest, createSession, findSession, upsertGitHubUser, audit } from './db.mjs';
const cookieName=(origin)=>origin.startsWith('https://')?'__Host-ben_session':'ben_session';
const nonce=()=>randomBytes(32).toString('base64url');
const parseCookies=s=>Object.fromEntries(String(s||'').split(';').map(v=>v.trim()).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)]}));
const safeSame=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;return timingSafeEqual(Buffer.from(a),Buffer.from(b));};
export function authConfig(env=process.env){
 const baseUrl=(env.BEN_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
 const url=new URL(baseUrl);
 if(!['localhost','127.0.0.1'].includes(url.hostname) && url.protocol!=='https:')throw Error('BEN_BASE_URL requires HTTPS outside localhost');
 const ids=x=>new Set(String(x||'').split(',').map(s=>Number(s.trim())).filter(Number.isSafeInteger).filter(n=>n>0));
 return {baseUrl,clientId:env.GITHUB_CLIENT_ID||'',clientSecret:env.GITHUB_CLIENT_SECRET||'',founderIds:ids(env.BEN_FOUNDER_GITHUB_IDS),stewardIds:ids(env.BEN_STEWARD_GITHUB_IDS),
  signupsEnabled:env.BEN_SIGNUPS_ENABLED==='true',adoptedCode:env.BEN_ADOPTED_CODE_VERSION||'',host:env.HOST||'127.0.0.1',port:Number(env.PORT||8787)};
}
export function roleFor(profile,cfg){return cfg.founderIds.has(Number(profile.github_id))?'founder':cfg.stewardIds.has(Number(profile.github_id))?'steward':'member';}
export function authProvider(overrides={}){
 return {async exchangeCode(code,cfg){
  const r=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{accept:'application/json','content-type':'application/json','user-agent':'BENEvolent-Energy-Network-v0.3'},
   body:JSON.stringify({client_id:cfg.clientId,client_secret:cfg.clientSecret,code,redirect_uri:cfg.baseUrl+'/auth/github/callback'})});
  if(!r.ok)throw Error('GitHub OAuth exchange unsuccessful');const j=await r.json();if(!j.access_token)throw Error('GitHub OAuth denied');return j.access_token;
 },async getGitHubUser(token){
  const r=await fetch('https://api.github.com/user',{headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','user-agent':'BENEvolent-Energy-Network-v0.3'}});
  if(!r.ok)throw Error('GitHub identity lookup unsuccessful');return r.json();
 },...overrides};
}
export function createAuth(db,cfg,provider=authProvider()){
 const secure=cfg.baseUrl.startsWith('https://');const name=cookieName(cfg.baseUrl);
 const fmt=(key,val,age,path='/')=>`${key}=${val}; Path=${path}; Max-Age=${age}; HttpOnly; SameSite=Lax${secure?'; Secure':''}`;
 const clear=(key)=>fmt(key,'',0);
 function redirect(res,url,cookies=[]){res.writeHead(302,{'location':url,'cache-control':'no-store','referrer-policy':'no-referrer',...(cookies.length?{'set-cookie':cookies}:{})});res.end();}
 function identify(req){const cookies=parseCookies(req.headers.cookie);const token=cookies[name];if(!token)return null;const u=findSession(db,digest(token));if(!u)return null;
  const role=roleFor(u,cfg);return {...u,role,privileged:u.status!=='suspended'&&(role==='founder'||role==='steward')};}
 function checkMutation(req,user){if(!user)return {status:401,error:'Sign in required.'};
  const origin=req.headers.origin;if(origin!==new URL(cfg.baseUrl).origin)return {status:403,error:'Request origin not allowed.'};
  if(!safeSame(req.headers['x-ben-csrf'],user.csrf))return {status:403,error:'Missing or invalid CSRF token.'};
  return null;}
 function requireMember(user){return user && user.status!=='suspended' && (user.status==='active'||user.privileged);}
 function start(res){if(!cfg.clientId||!cfg.clientSecret){redirect(res,'/?auth=not-configured');return;}
  const state=nonce();createLoginState(db,digest(state));
  const u=new URL('https://github.com/login/oauth/authorize');u.searchParams.set('client_id',cfg.clientId);u.searchParams.set('redirect_uri',cfg.baseUrl+'/auth/github/callback');u.searchParams.set('state',state);
  // No repo scope. GitHub identity is used only for site sign-in.
  redirect(res,u.toString(),[fmt('ben_oauth_state',state,600)]);
 }
 async function callback(req,res,url){const state=url.searchParams.get('state');const code=url.searchParams.get('code');const cookies=parseCookies(req.headers.cookie);
  if(!state||!code||!safeSame(state,cookies.ben_oauth_state)||!consumeLoginState(db,digest(state))){redirect(res,'/?auth=invalid-state',[clear('ben_oauth_state')]);return;}
  try{
   const token=await provider.exchangeCode(code,cfg);
   const github=await provider.getGitHubUser(token);
   const user=upsertGitHubUser(db,github);
   const session=nonce();const csrf=nonce();createSession(db,user.id,digest(session),csrf);
   audit(db,user.id,'sign_in','session',user.id);
   redirect(res,'/#home',[clear('ben_oauth_state'),fmt(name,session,3*24*60*60)]);
  }catch(e){redirect(res,'/?auth=failed',[clear('ben_oauth_state')]);}
 }
 function logout(req,res,user){const cookies=parseCookies(req.headers.cookie);if(cookies[name])db.prepare('DELETE FROM sessions WHERE hash=?').run(digest(cookies[name]));
  if(user)audit(db,user.id,'sign_out','session',user.id);
  res.setHeader('set-cookie',clear(name));}
 return {identify,checkMutation,requireMember,start,callback,logout,config:cfg};
}
