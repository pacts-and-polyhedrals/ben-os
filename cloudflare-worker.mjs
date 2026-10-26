/**
 * B.E.N. OS — Cloudflare Workers identity bootstrap (v0.3.1).
 * Purpose: verified GitHub sign-in, founder-only staging access and D1 sessions.
 * This is NOT the full v0.3 community backend. Registration remains CLOSED.
 * No secrets, user tokens, or member data are included in this source file.
 */

const SESSION_AGE_SECONDS = 24 * 60 * 60;
const STATE_AGE_SECONDS = 10 * 60;
const COOKIE_SESSION = '__Host-ben_session';
const COOKIE_STATE = '__Host-ben_oauth_state';
const encoder = new TextEncoder();

function nonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
async function sha256(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
}
function cookieValue(req, name) {
  const entry = (req.headers.get('cookie') || '').split(';')
    .map(s => s.trim()).find(s => s.startsWith(name + '='));
  return entry ? entry.slice(name.length + 1) : '';
}
function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
function redirect(to, cookies = []) {
  const h = new Headers({ Location: to, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const c of cookies) h.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers: h });
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' },
  });
}
function esc(x) {
  return String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function html(content, status = 200) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>B.E.N. — Staging Identity</title>
<style>html{font-family:system-ui,sans-serif;background:#151024;color:#f5efff}body{max-width:790px;margin:6vh auto;padding:20px}main{background:#251a3c;border:1px solid #62447f;border-radius:18px;padding:clamp(22px,5vw,38px)}h1{font-size:clamp(2rem,5vw,3rem);line-height:1.1}h1 em{color:#f9c96a;font-style:normal}p,li{line-height:1.65;color:#d4c6e6}.pill{color:#d9bfef;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase}a,.btn{color:#fbd17e}.btn{display:inline-block;background:#f9c96a;color:#1a1232;padding:12px 20px;border:0;border-radius:12px;font-size:1rem;font-weight:700;text-decoration:none;cursor:pointer}a:focus-visible,.btn:focus-visible{outline:3px solid white;outline-offset:4px}.quiet{color:#c7b5dd}.card{background:#342447;padding:18px;border-radius:12px;margin:18px 0}.safe{color:#b9f2c9}.warning{color:#ffd38d}footer{padding-top:30px;color:#a99bc2;font-size:.9rem}</style></head>
<body><main><div class="pill">B.E.N. · Be Even Nicer · Founder staging</div>${content}
</main><footer>Benevolent Energy Network · Human-led · Prototype only · No public registration</footer></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' },
  });
}
function config(env) {
  const base = String(env.BEN_BASE_URL || '').replace(/\/$/, '');
  const allowed = s => new Set(String(s || '').split(',').map(n => Number(n.trim()))
    .filter(n => Number.isSafeInteger(n) && n > 0));
  return { base, clientId: env.GITHUB_CLIENT_ID || '', secret: env.GITHUB_CLIENT_SECRET || '',
    founders: allowed(env.BEN_FOUNDER_GITHUB_IDS), stewards: allowed(env.BEN_STEWARD_GITHUB_IDS) };
}
function validateConfig(req, env, cfg) {
  if (!env.DB || !cfg.clientId || !cfg.secret || !cfg.base) return 'Missing required Cloudflare binding or GitHub configuration.';
  let actual, expected;
  try { actual = new URL(req.url).origin; expected = new URL(cfg.base).origin; }
  catch { return 'Invalid configured application URL.'; }
  if (actual !== expected || !expected.startsWith('https://')) return 'Application origin mismatch. Check BEN_BASE_URL.';
  return '';
}
function role(githubId, cfg) {
  if (cfg.founders.has(githubId)) return 'founder';
  if (cfg.stewards.has(githubId)) return 'steward';
  return 'pending';
}
async function session(req, env, cfg) {
  const token = cookieValue(req, COOKIE_SESSION);
  if (!token || token.length > 120) return null;
  const user = await env.DB.prepare(`SELECT u.id, u.github_id, u.github_login, u.display_name,
        u.status, s.csrf FROM sessions s JOIN users u ON u.id=s.user_id
        WHERE s.hash=? AND s.expires_at>? LIMIT 1`)
    .bind(await sha256(token), Date.now()).first();
  if (!user || user.status === 'suspended') return null;
  return { ...user, role: role(Number(user.github_id), cfg) };
}
async function startAuth(req, env, cfg) {
  if (!cfg.founders.size && !cfg.stewards.size) return html('<h1>Sign-in not enabled</h1><p>No founder accounts have been authorised yet.</p>', 503);
  const state = nonce();
  await env.DB.prepare('DELETE FROM oauth_states WHERE expires_at<?').bind(Date.now()).run();
  const states = await env.DB.prepare('SELECT COUNT(*) AS n FROM oauth_states').first();
  if (Number(states?.n || 0) >= 200) return json({error:'Staging sign-in is temporarily busy. Try again later.'},429);
  await env.DB.prepare('INSERT INTO oauth_states(hash,expires_at) VALUES (?,?)')
    .bind(await sha256(state), Date.now() + STATE_AGE_SECONDS * 1000).run();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('redirect_uri', cfg.base + '/auth/github/callback');
  url.searchParams.set('state', state);
  // No "repo" scope. This authenticates identity; it does not grant GitHub code access.
  return redirect(url.toString(), [cookie(COOKIE_STATE, state, STATE_AGE_SECONDS)]);
}
async function authCallback(req, env, cfg, githubFetch) {
  const url = new URL(req.url);
  const incoming = url.searchParams.get('state') || '';
  const stored = cookieValue(req, COOKIE_STATE);
  const clear = cookie(COOKIE_STATE, '', 0);
  if (url.searchParams.has('error')) return redirect('/?auth=declined', [clear]);
  if (!incoming || !stored || incoming.length > 130 || incoming !== stored || !url.searchParams.get('code')) {
    return redirect('/?auth=invalid-state', [clear]);
  }
  const consumed = await env.DB.prepare('DELETE FROM oauth_states WHERE hash=? AND expires_at>?')
    .bind(await sha256(incoming), Date.now()).run();
  if (consumed.meta?.changes !== 1) return redirect('/?auth=invalid-state', [clear]);
  try {
    const response = await githubFetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { accept:'application/json', 'content-type':'application/json', 'user-agent':'BEN-OS-Staging-0.3.1' },
      body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.secret,
        code: url.searchParams.get('code'), redirect_uri: cfg.base + '/auth/github/callback' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('GitHub token request rejected');
    const exchanged = await response.json();
    if (!exchanged.access_token) throw new Error('GitHub token missing');
    const identityResponse = await githubFetch('https://api.github.com/user', {
      headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${exchanged.access_token}`,
        'user-agent': 'BEN-OS-Staging-0.3.1', 'x-github-api-version':'2022-11-28' },
      signal: AbortSignal.timeout(10000),
    });
    if (!identityResponse.ok) throw new Error('GitHub identity request rejected');
    const identity = await identityResponse.json();
    const githubId = Number(identity.id);
    if (!Number.isSafeInteger(githubId) || !identity.login || typeof identity.login !== 'string')
      throw new Error('Invalid GitHub identity');
    // Staging is founder-only. Everyone else is denied before their identity is saved.
    if (role(githubId, cfg) === 'pending') return redirect('/?auth=not-authorized', [clear]);
    const now = Date.now();
    const accountId = crypto.randomUUID();
    const login = identity.login.slice(0, 90);
    const display = String(identity.name || identity.login).slice(0, 120);
    await env.DB.prepare(`INSERT INTO users(id,github_id,github_login,display_name,joined_at,last_login)
      VALUES (?,?,?,?,?,?) ON CONFLICT(github_id) DO UPDATE SET
        github_login=excluded.github_login,display_name=excluded.display_name,
        last_login=excluded.last_login`).bind(accountId,githubId,login,display,now,now).run();
    const user = await env.DB.prepare('SELECT id,status FROM users WHERE github_id=? LIMIT 1').bind(githubId).first();
    if (!user || user.status === 'suspended') return redirect('/?auth=not-authorized', [clear]);
    const token = nonce(), csrf = nonce();
    await env.DB.prepare('INSERT INTO sessions(hash,user_id,csrf,expires_at) VALUES(?,?,?,?)')
      .bind(await sha256(token),user.id,csrf,now + SESSION_AGE_SECONDS * 1000).run();
    return redirect('/admin', [clear, cookie(COOKIE_SESSION,token,SESSION_AGE_SECONDS)]);
  } catch (_) {
    // No GitHub token, client secret, code, or identity is ever written to logs.
    return redirect('/?auth=github-failed', [clear]);
  }
}
function authMessage(code) {
  return {
    declined: 'GitHub authorisation was cancelled.',
    'invalid-state': 'The login validation failed or expired. Please start again.',
    'not-authorized': 'This staging environment is only available to explicitly authorised founders or stewards.',
    'github-failed': 'GitHub sign-in could not be completed. Check the GitHub App callback and try again.',
  }[code] || '';
}
function homepage(user, code) {
  const message = authMessage(code);
  return html(`<h1>Be <em>Even</em> Nicer.</h1>
  <p>This private staging gateway is where we test GitHub sign-in and founder permissions before activating the full B.E.N. community OS.</p>
  ${message ? `<div class="card warning">${esc(message)}</div>` : ''}
  ${user ? `<div class="card safe">Signed in as ${esc(user.github_login)} (${esc(user.role)}).</div><a class="btn" href="/admin">Open founder dashboard</a>`
    : '<p><a class="btn" href="/auth/github">Sign in with GitHub</a></p>'}
  <p class="quiet">Public membership is closed. Your GitHub sign-in grants no repository permissions.</p>
  <p><a href="https://pacts-and-polyhedrals.github.io/ben-os/">Visit the existing public B.E.N. website</a></p>`);
}
async function founderPage(user, env) {
  if (!user) return redirect('/?auth=not-authorized');
  if (!['founder','steward'].includes(user.role)) return html('<h1>Access denied</h1><p>This area requires explicitly authorised founder or steward access.</p>', 403);
  const users = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  const sessions = await env.DB.prepare('SELECT COUNT(*) AS n FROM sessions WHERE expires_at>?')
    .bind(Date.now()).first();
  return html(`<h1>B.E.N. <em>Founder Staging</em></h1>
  <div class="card"><strong class="safe">GitHub identity verified</strong><br>
    Account: <strong>${esc(user.github_login)}</strong><br>
    B.E.N. role: <strong>${esc(user.role)}</strong><br>
    GitHub ID: <strong>${esc(user.github_id)}</strong>
  </div>
  <div class="card"><strong>D1 authentication database connected</strong>
    <p>Authorised accounts recorded: ${Number(users?.n || 0)}<br>
    Active sessions: ${Number(sessions?.n || 0)}</p>
  </div>
  <p class="warning">This verifies authentication and access controls only. The founder work board, member services, safeguarding and AI are not yet live on this Worker.</p>
  <p><a href="https://github.com/pacts-and-polyhedrals/ben-os">Review the GitHub project</a> ·
  <a href="https://pacts-and-polyhedrals.github.io/ben-os/">Public B.E.N. preview</a></p>
  <form method="post" action="/auth/logout"><input type="hidden" name="csrf" value="${esc(user.csrf)}">
    <button class="btn" type="submit">Sign out</button></form>`);
}

export async function handleRequest(req, env, githubFetch = fetch) {
  const cfg = config(env);
  const u = new URL(req.url), pathname = u.pathname;
  const error = validateConfig(req, env, cfg);
  if (error) return json({ status:'not-ready', message:error }, 503);
  try {
    if (pathname === '/api/health' && req.method === 'GET') {
      const result = await env.DB.prepare('SELECT 1 AS ok').first();
      return json({ service:'B.E.N. founder staging', version:'0.3.1', databaseConnected:result?.ok===1,
        loginConfigured:true, registrationEnabled:false, modelConnected:false, status:'auth-only' });
    }
    if (pathname === '/auth/github' && req.method === 'GET') return startAuth(req,env,cfg);
    if (pathname === '/auth/github/callback' && req.method === 'GET') return authCallback(req,env,cfg,githubFetch);
    const user = await session(req,env,cfg);
    if (pathname === '/api/me' && req.method === 'GET') return json({user:user ? {
      name:user.display_name, githubLogin:user.github_login, role:user.role, status:user.status,
      githubId:user.github_id } : null, registrationOpen:false,
      note:'Founder staging only. No member registration or additional role permissions.' });
    if (pathname === '/admin' && req.method === 'GET') return founderPage(user,env);
    if (pathname === '/auth/logout' && req.method === 'POST') {
      if (!user) return redirect('/');
      const refererOrigin = req.headers.get('origin');
      if (refererOrigin !== cfg.base) return json({error:'Origin rejected'},403);
      const body = await req.formData();
      if (body.get('csrf') !== user.csrf) return json({error:'CSRF validation failed'},403);
      const token = cookieValue(req,COOKIE_SESSION);
      await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await sha256(token)).run();
      return redirect('/',[cookie(COOKIE_SESSION,'',0)]);
    }
    if (pathname === '/' && req.method === 'GET') return homepage(user,u.searchParams.get('auth'));
    if (pathname.startsWith('/api/')) return json({error:'This endpoint is not installed in the staging identity gateway.'},501);
    return html('<h1>Not found</h1><p><a href="/">Return to B.E.N. staging</a></p>',404);
  } catch (_) {
    // Generic error only. Logs and browser responses must not expose secret or user details.
    return json({error:'B.E.N. staging encountered a server error. Confirm the D1 tables and binding.'},500);
  }
}
export default { fetch: (request, env) => handleRequest(request, env) };
