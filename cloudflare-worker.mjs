/**
 * B.E.N. OS — Cloudflare Workers founder workspace + public status probe (v0.3.3).
 * Purpose: preserve verified GitHub sign-in and add a founder-only progress board backed by D1.
 * This is NOT the full community backend; member registration remains CLOSED.
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
<style>html{font-family:system-ui,sans-serif;background:#151024;color:#f5efff}body{max-width:790px;margin:6vh auto;padding:20px}main{background:#251a3c;border:1px solid #62447f;border-radius:18px;padding:clamp(22px,5vw,38px)}h1{font-size:clamp(2rem,5vw,3rem);line-height:1.1}h1 em{color:#f9c96a;font-style:normal}p,li{line-height:1.65;color:#d4c6e6}.pill{color:#d9bfef;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase}a,.btn{color:#fbd17e}.btn{display:inline-block;background:#f9c96a;color:#1a1232;padding:12px 20px;border:0;border-radius:12px;font-size:1rem;font-weight:700;text-decoration:none;cursor:pointer}a:focus-visible,.btn:focus-visible{outline:3px solid white;outline-offset:4px}.quiet{color:#c7b5dd}.card{background:#342447;padding:18px;border-radius:12px;margin:18px 0}.safe{color:#b9f2c9}.warning{color:#ffd38d}footer{padding-top:30px;color:#a99bc2;font-size:.9rem}
summary{cursor:pointer;font-weight:650;padding:4px 0;line-height:1.5}summary:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #f9c96a;outline-offset:3px}.task{border:1px solid #634881;border-radius:12px;padding:14px;margin:12px 0;background:#2f2248}.task small{color:#d8bbf3}.task p{margin:.7em 0}.task label{display:block;margin:12px 0 4px;color:#f3e2ff;font-weight:600}.task input,.task select{width:100%;padding:9px;border-radius:8px;border:1px solid #8069a2;background:#1a132b;color:#fff;font:inherit;box-sizing:border-box}.task .btn{margin-top:14px}.mini{color:#d5c6e7;font-size:.9rem}.grid{display:flex;flex-wrap:wrap;gap:12px}.grid .card{flex:1 1 140px;margin:8px 0}.toplinks{display:flex;gap:14px;flex-wrap:wrap}.sectiontitle{border-top:1px solid #685080;padding-top:16px;margin-top:28px}.updated{background:#214631;color:#d6ffe1;padding:10px;border-radius:9px}.lock{opacity:.85}a{overflow-wrap:anywhere}</style></head>
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

// Non-sensitive founding action SNAPSHOT (1 October 2026); not a live policy or vote register.
const FOUNDING_ACTIONS = Object.freeze([{"id":"ACT-001","workstream":"Founding","title":"Review and agree Charter and Code","priority":"High","policyRef":"01/02","nextStep":"Read drafts; record amendments."},{"id":"ACT-002","workstream":"Founding","title":"Agree Governance and numeric thresholds","priority":"High","policyRef":"03","nextStep":"Test voting and recusal scenarios."},{"id":"ACT-003","workstream":"Founding","title":"Record adoption and effective date","priority":"High","policyRef":"07 T01","nextStep":"Hold founding meeting and minute vote."},{"id":"ACT-004","workstream":"People","title":"Assign six leads and named backups","priority":"High","policyRef":"03","nextStep":"Complete Roles and appointment records."},{"id":"ACT-005","workstream":"People","title":"Appoint three Governance members","priority":"High","policyRef":"03","nextStep":"Reserved vote; confirm conflict / replacement process."},{"id":"ACT-006","workstream":"Safety","title":"Establish primary and alternative report contacts","priority":"High","policyRef":"04","nextStep":"Test both inboxes and explain monitoring hours."},{"id":"ACT-007","workstream":"Safety","title":"Secure an independent appeal arrangement","priority":"High","policyRef":"04","nextStep":"Confirm three competent reviewers and confidentiality."},{"id":"ACT-008","workstream":"Safety","title":"Train moderators and run three scenarios","priority":"High","policyRef":"04","nextStep":"Record lessons; resolve failures before invitations."},{"id":"ACT-009","workstream":"Privacy","title":"Confirm responsible holder, jurisdictions and privacy notice","priority":"High","policyRef":"06/07 T08","nextStep":"Obtain necessary advice and fill every live field."},{"id":"ACT-010","workstream":"Security","title":"Set up named account access, MFA and recovery","priority":"High","policyRef":"06","nextStep":"Verify access and recovery without sharing secrets."},{"id":"ACT-011","workstream":"Security","title":"Separate member, steward and casework storage","priority":"High","policyRef":"06","nextStep":"Test ordinary member and conflicted-founder access."},{"id":"ACT-012","workstream":"Community","title":"Confirm membership / adult-only launch rules","priority":"High","policyRef":"01/02","nextStep":"Record the actual eligibility decision."},{"id":"ACT-013","workstream":"Community","title":"Establish and maintain the B.E.N. WhatsApp Community","priority":"High","policyRef":"02","nextStep":"Start with Central, Culture & Entertainment, Wellbeing and active Gaming groups; assign admin cover, then consult members before adding groups."},{"id":"ACT-014","workstream":"Content","title":"Adopt publishing tiers and reviewer rota","priority":"High","policyRef":"05","nextStep":"Test a Green, Amber and Red item without publishing."},{"id":"ACT-015","workstream":"Operations","title":"Choose live master locations and repair cloud links","priority":"High","policyRef":"00/06","nextStep":"Open links in an ordinary member account."},{"id":"ACT-016","workstream":"Launch","title":"Approve a limited pilot invitation","priority":"High","policyRef":"00","nextStep":"Verify all mandatory gates and record go/no-go."},{"id":"ACT-017","workstream":"Review","title":"Hold the 30-day pilot review","priority":"Normal","policyRef":"00/03","nextStep":"Set date, collect feedback and publish changes."},{"id":"ACT-018","workstream":"Democracy","title":"Track the six-month / 50-member election trigger","priority":"Normal","policyRef":"03","nextStep":"Keep minimal roll; begin preparation at 30 active members."},{"id":"ACT-019","workstream":"Finance","title":"Decide whether money-related activity is needed","priority":"Normal","policyRef":"06","nextStep":"Keep disabled until currency, approvals and obligations are settled."},{"id":"ACT-020","workstream":"Activities","title":"Assess any in-person or higher-risk event","priority":"Normal","policyRef":"06","nextStep":"Do not offer unsupported activities."},{"id":"ACT-021","workstream":"Continuity","title":"Test backup restoration and steward handover","priority":"Normal","policyRef":"06/07 T09","nextStep":"Record check and next quarterly review."},{"id":"ACT-022","workstream":"Records","title":"Adopt retention review rules and access reviews","priority":"Normal","policyRef":"06","nextStep":"Check case-specific obligations and set review dates."}]);
const ACTION_IDS = new Set(FOUNDING_ACTIONS.map(a => a.id));
const ACTION_STATES = new Set(['not_started','in_progress','needs_review','completed']);
const ACTION_LABELS = {not_started:'Not started',in_progress:'In progress',needs_review:'Needs review',completed:'Completed (reported)'};
function permitted(user) { return Boolean(user && (user.role === 'founder' || user.role === 'steward')); }
async function boardReady(env) {
  try { await env.DB.prepare('SELECT COUNT(*) AS n FROM founder_updates').first();
    await env.DB.prepare('SELECT COUNT(*) AS n FROM audit').first(); return true;
  } catch { return false; }
}
async function boardData(env) {
  const data = await env.DB.prepare('SELECT action_id, state, public_note, evidence_ref, updated_at FROM founder_updates').all();
  const entries = data?.results || [];
  const updates = new Map(entries.map(x => [x.action_id,x]));
  const actions = FOUNDING_ACTIONS.map(a => ({...a,update:updates.get(a.id)||null}));
  const totals = Object.fromEntries([...ACTION_STATES].map(state => [state,actions.filter(a => (a.update?.state || 'not_started')===state).length]));
  return {actions,totals,sourceDate:'2026-10-01',note:'This work board tracks claimed progress, not legally adopted policies or formal votes.'};
}
function stateSelect(current) {
  return [...ACTION_STATES].map(s => `<option value="${s}"${s===current?' selected':''}>${ACTION_LABELS[s]}</option>`).join('');
}
async function saveAction(req, user, env, cfg) {
  if (!permitted(user)) return json({error:'Founder or steward authorisation is required.'},403);
  if (!(await boardReady(env))) return json({error:'The founder database migration has not been applied.'},503);
  if (req.headers.get('origin') !== cfg.base) return json({error:'Origin rejected'},403);
  const contentType = req.headers.get('content-type') || '';
  if (!/^application\/x-www-form-urlencoded\b/i.test(contentType)) return json({error:'Unsupported form format.'},415);
  if (Number(req.headers.get('content-length')||0) > 3500) return json({error:'Form exceeds allowed length.'},413);
  // Enforce a byte cap even when Content-Length is missing or incorrect.
  if (!req.body) return json({error:'An update form is required.'},400);
  const reader = req.body.getReader(), pieces=[];
  let total=0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 3500) { await reader.cancel(); return json({error:'Form exceeds allowed length.'},413); }
    pieces.push(value);
  }
  const bytes=new Uint8Array(total); let offset=0;
  for(const part of pieces){ bytes.set(part,offset);offset+=part.byteLength; }
  const form = new URLSearchParams(new TextDecoder().decode(bytes));
  if (form.get('csrf') !== user.csrf) return json({error:'CSRF validation failed'},403);
  const actionId = String(form.get('actionId')||'');
  const state = String(form.get('state')||'');
  const publicNote = String(form.get('publicNote')||'').trim();
  const evidenceRef = String(form.get('evidenceRef')||'').trim();
  if (!ACTION_IDS.has(actionId) || !ACTION_STATES.has(state)) return json({error:'Invalid action or status'},400);
  if (publicNote.length>350 || evidenceRef.length>130 || /[\r\n\0]/.test(evidenceRef)) return json({error:'Field length or format invalid'},400);
  if (/(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{10,}\d)/i.test(publicNote+' '+evidenceRef))
    return json({error:'Please do not put personal contact information in founder progress notes.'},400);
  if (state==='completed' && !evidenceRef) return json({error:'A non-sensitive evidence reference is required for a completed task.'},400);
  const now=Date.now();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO founder_updates(action_id,state,public_note,evidence_ref,owner_note,updated_by,updated_at)
      VALUES(?,?,?,?,?,?,?) ON CONFLICT(action_id) DO UPDATE SET
      state=excluded.state, public_note=excluded.public_note, evidence_ref=excluded.evidence_ref,
      updated_by=excluded.updated_by, updated_at=excluded.updated_at`)
      .bind(actionId,state,publicNote,evidenceRef,'',user.id,now),
    env.DB.prepare('INSERT INTO audit(id,actor_id,action,entity,record_id,created_at) VALUES(?,?,?,?,?,?)')
      .bind(crypto.randomUUID(),user.id,'founder_progress_updated','founder_action',actionId,now),
  ]);
  return new Response(null,{status:303,headers:{'Location':'/admin?updated='+encodeURIComponent(actionId),'Cache-Control':'no-store'}});
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
async function founderPage(user, env, saved) {
  if (!user) return redirect('/?auth=not-authorized');
  if (!permitted(user)) return html('<h1>Access denied</h1><p>This area requires explicitly authorised founder or steward access.</p>', 403);
  const users = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  const sessions = await env.DB.prepare('SELECT COUNT(*) AS n FROM sessions WHERE expires_at>?')
    .bind(Date.now()).first();
  const ready = await boardReady(env);
  const board = ready ? await boardData(env) : null;
  const byWorkstream = new Map();
  for (const a of board?.actions || []) {
    if (!byWorkstream.has(a.workstream)) byWorkstream.set(a.workstream, []);
    byWorkstream.get(a.workstream).push(a);
  }
  const list = [...byWorkstream.entries()].map(([stream, actions]) => `<section aria-label="${esc(stream)} founder tasks">
    <h2 class="sectiontitle">${esc(stream)}</h2>
    ${actions.map(a => `<details class="task" id="${esc(a.id)}"><summary>${esc(a.id)} · ${esc(a.title)} <small>(${esc(ACTION_LABELS[a.update?.state || 'not_started'])})</small></summary>
      <p>${esc(a.nextStep)}</p><p class="mini">Priority: ${esc(a.priority)} · Policy reference (draft): ${esc(a.policyRef)}</p>
      <form action="/admin/task" method="post">
      <input type="hidden" name="csrf" value="${esc(user.csrf)}"><input type="hidden" name="actionId" value="${esc(a.id)}">
      <label for="state-${esc(a.id)}">Progress</label><select id="state-${esc(a.id)}" name="state">${stateSelect(a.update?.state||'not_started')}</select>
      <label for="note-${esc(a.id)}">Progress note (no private details)</label><input id="note-${esc(a.id)}" name="publicNote" value="${esc(a.update?.public_note||'')}" maxlength="350" placeholder="What has changed?">
      <label for="evidence-${esc(a.id)}">Non-sensitive evidence ID or reference</label><input id="evidence-${esc(a.id)}" name="evidenceRef" value="${esc(a.update?.evidence_ref||'')}" maxlength="130" placeholder="Minutes reference or GitHub issue number">
      ${a.update?.updated_at ? `<p class="mini">Updated ${new Date(a.update.updated_at).toLocaleDateString('en-GB',{timeZone:'UTC'})} UTC</p>` : ''}
      <button class="btn" type="submit">Save progress</button></form></details>`).join('')}
  </section>`).join('');
  const totals = board?.totals || {};
  return html(`<h1>B.E.N. <em>Founder Workspace</em></h1>
  <div class="card"><strong class="safe">GitHub identity verified</strong><br>
    Account: <strong>${esc(user.github_login)}</strong> · Role: <strong>${esc(user.role)}</strong> · GitHub ID: <strong>${esc(user.github_id)}</strong>
  </div>
  <div class="card"><strong>D1 login database connected</strong><p>Authorised accounts: ${Number(users?.n||0)} · Active sessions: ${Number(sessions?.n||0)}</p></div>
  ${saved && ACTION_IDS.has(saved) ? `<p class="updated" role="status">${esc(saved)} progress saved. This is not a formal approval.</p>` : ''}
  ${ready ? `<h2>Founding action board</h2><p>These ${FOUNDING_ACTIONS.length} tasks are a historical snapshot from 1 October 2026; they do not prove current completion or constitute founder decisions. Start by confirming them with the team.</p>
    <div class="grid"><div class="card">Not started<br><strong>${totals.not_started||0}</strong></div><div class="card">In progress<br><strong>${totals.in_progress||0}</strong></div><div class="card">Needs review<br><strong>${totals.needs_review||0}</strong></div><div class="card">Reported completed<br><strong>${totals.completed||0}</strong></div></div>
    <p class="warning">Do not enter member identities, casework, passwords, confidential finances or personal contact details here. A “completed” status is only a work update. Adoption, safeguarding approval and legal votes require independently recorded human decisions.</p>
    ${list}
  ` : `<div class="card warning"><strong>One more setup step required:</strong> Run the versioned SQL in <code>ben-founder-schema.sql</code> against your staging D1 database. Your existing GitHub login will continue working until then.</div>`}
  <p class="toplinks"><a href="/api/steward/launch">Read founder workboard JSON</a><a href="https://github.com/pacts-and-polyhedrals/ben-os">GitHub repository</a><a href="https://pacts-and-polyhedrals.github.io/ben-os/">Public B.E.N.</a></p>
  <p class="quiet">Founders' staging workspace. Public registration, private casework, payments and AI remain disabled until reviewed.</p>
  <form method="post" action="/auth/logout"><input type="hidden" name="csrf" value="${esc(user.csrf)}"><button class="btn" type="submit">Sign out</button></form>`);
}

export async function handleRequest(req, env, githubFetch = fetch) {
  const cfg = config(env);
  const u = new URL(req.url), pathname = u.pathname;
  const error = validateConfig(req, env, cfg);
  if (error) return json({ status:'not-ready', message:error }, 503);
  try {
    if (pathname === '/api/health' && req.method === 'GET') {
      const result = await env.DB.prepare('SELECT 1 AS ok').first();
      return json({ service:'B.E.N. founder staging', version:'0.3.3', databaseConnected:result?.ok===1, founderWorkspaceReady:await boardReady(env),
        loginConfigured:true, registrationEnabled:false, modelConnected:false, status:'founder-workspace-pilot' });
    }
    // Public read-only heartbeat for the GitHub Pages roadmap. No credentials,
    // member data, privileged decisions or private Drive links are returned.
    if (pathname === '/api/public-build-status' && req.method === 'GET') {
      const database = await env.DB.prepare('SELECT 1 AS ok').first();
      const workboard = await boardReady(env);
      const answer = json({
        service:'B.E.N. public build status', version:'0.3.3',
        checkedAt:new Date().toISOString(),
        runtime:{
          environment:'founder-staging',
          databaseConnected:database?.ok===1,
          founderWorkspaceReady:workboard,
          githubLoginConfigured:!!(cfg.clientId && cfg.secret && cfg.founders.size + cfg.stewards.size),
          registrationEnabled:false, aiConnected:false, driveConnected:false,
        },
        certification:'not-assessed',
        note:'Working technical milestones are not production certification or adopted governance.'
      });
      answer.headers.set('Access-Control-Allow-Origin','https://pacts-and-polyhedrals.github.io');
      answer.headers.set('Vary','Origin');
      answer.headers.set('Cross-Origin-Resource-Policy','cross-origin');
      return answer;
    }
    if (pathname === '/auth/github' && req.method === 'GET') return startAuth(req,env,cfg);
    if (pathname === '/auth/github/callback' && req.method === 'GET') return authCallback(req,env,cfg,githubFetch);
    const user = await session(req,env,cfg);
    if (pathname === '/api/me' && req.method === 'GET') return json({user:user ? {
      name:user.display_name, githubLogin:user.github_login, role:user.role, status:user.status,
      githubId:user.github_id } : null, registrationOpen:false,
      note:'Founder staging only. No member registration or additional role permissions.' });
    if (pathname === '/api/steward/launch' && req.method === 'GET') {
      if (!permitted(user)) return json({error:'Founder or steward authorisation required'},403);
      if (!(await boardReady(env))) return json({error:'D1 founder workspace migration is not yet installed'},503);
      return json(await boardData(env));
    }
    if (pathname === '/admin/task' && req.method === 'POST') return saveAction(req,user,env,cfg);
    if (pathname === '/admin' && req.method === 'GET') return founderPage(user,env,u.searchParams.get('updated'));
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
