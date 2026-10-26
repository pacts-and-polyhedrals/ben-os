import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
const now=()=>Date.now();
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function openDatabase(filename=process.env.BEN_DB_PATH||path.resolve('.local/ben.sqlite')){
  if(filename!==':memory:')mkdirSync(path.dirname(path.resolve(filename)),{recursive:true,mode:0o700});
  const db=new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  if(filename!==':memory:')db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, github_id INTEGER UNIQUE NOT NULL, github_login TEXT NOT NULL,
    display_name TEXT NOT NULL, joined_at INTEGER NOT NULL, last_login INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended')),
    code_version TEXT, adult_attested INTEGER NOT NULL DEFAULT 0,
    creative_bio TEXT NOT NULL DEFAULT '', creative_disciplines TEXT NOT NULL DEFAULT '[]',
    creative_tags TEXT NOT NULL DEFAULT '[]', open_to_collab INTEGER NOT NULL DEFAULT 0,
    open_to_mentor INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS oauth_states (hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('project','event','help_offer','help_request','proposal')),
    author_id TEXT NOT NULL,title TEXT NOT NULL,summary TEXT NOT NULL,category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed','approved','closed')),
    starts_at TEXT, general_location TEXT, approved_by TEXT,
    created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE INDEX IF NOT EXISTS activities_kind_status ON activities(kind,status,created_at);
  CREATE TABLE IF NOT EXISTS participation (activity_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,
    created_at INTEGER NOT NULL,PRIMARY KEY(activity_id,user_id,kind),
    FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY, requester TEXT NOT NULL, recipient TEXT NOT NULL,
    message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
    created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
    FOREIGN KEY(requester) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(recipient) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS member_blocks (
    blocker_id TEXT NOT NULL,blocked_id TEXT NOT NULL,created_at INTEGER NOT NULL,
    PRIMARY KEY(blocker_id,blocked_id),
    FOREIGN KEY(blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(blocked_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS gratitude (
    id TEXT PRIMARY KEY,sender_id TEXT NOT NULL,recipient_id TEXT NOT NULL,
    message TEXT NOT NULL,created_at INTEGER NOT NULL,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS creative_journal (
    id TEXT PRIMARY KEY,user_id TEXT NOT NULL,discipline_id TEXT NOT NULL,
    stage TEXT NOT NULL CHECK(stage IN ('foundations','experiment','reflection','collaboration')),
    notes TEXT NOT NULL,reflection TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE INDEX IF NOT EXISTS journal_user_recent ON creative_journal(user_id,created_at);
  CREATE TABLE IF NOT EXISTS github_publications (
    proposal_id TEXT PRIMARY KEY,
    state TEXT NOT NULL CHECK(state IN ('pending','published','uncertain')),
    issue_number INTEGER,issue_url TEXT,
    published_by TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
    FOREIGN KEY(proposal_id) REFERENCES activities(id),FOREIGN KEY(published_by) REFERENCES users(id));
  CREATE TABLE IF NOT EXISTS founder_updates (
    action_id TEXT PRIMARY KEY,state TEXT NOT NULL CHECK(state IN ('not_started','in_progress','needs_review','completed')),
    public_note TEXT NOT NULL, evidence_ref TEXT NOT NULL, owner_note TEXT NOT NULL,
    updated_by TEXT NOT NULL,updated_at INTEGER NOT NULL,
    FOREIGN KEY(updated_by) REFERENCES users(id));
  CREATE TABLE IF NOT EXISTS audit (
    id TEXT PRIMARY KEY,actor_id TEXT,action TEXT NOT NULL,entity TEXT NOT NULL,record_id TEXT,
    created_at INTEGER NOT NULL,FOREIGN KEY(actor_id) REFERENCES users(id));
  `);
  return db;
}
export function audit(db, actor,action,entity,id=''){
  db.prepare('INSERT INTO audit (id,actor_id,action,entity,record_id,created_at) VALUES (?,?,?,?,?,?)')
    .run(randomUUID(),actor||null,action,entity,String(id),now());
}
export function upsertGitHubUser(db,profile){
  if(!Number.isSafeInteger(profile.id)||profile.id<1||typeof profile.login!=='string')throw Error('Invalid GitHub profile');
  const id=profile.id;const login=profile.login.slice(0,80);const name=(profile.name||login).slice(0,120);
  const previous=db.prepare('SELECT * FROM users WHERE github_id=?').get(id);
  if(previous){
    db.prepare('UPDATE users SET github_login=?, display_name=?,last_login=? WHERE github_id=?').run(login,name,now(),id);
    return db.prepare('SELECT * FROM users WHERE github_id=?').get(id);
  }
  const uid=randomUUID();db.prepare('INSERT INTO users (id,github_id,github_login,display_name,joined_at,last_login) VALUES (?,?,?,?,?,?)')
    .run(uid,id,login,name,now(),now());
  audit(db,uid,'github_sign_in_created','user',uid);
  return db.prepare('SELECT * FROM users WHERE id=?').get(uid);
}
export function createLoginState(db,hash){
  db.prepare('DELETE FROM oauth_states WHERE expires_at<?').run(now());
  db.prepare('INSERT INTO oauth_states VALUES (?,?)').run(hash,now()+10*60*1000);
}
export function consumeLoginState(db,hash){
  const result=db.prepare('DELETE FROM oauth_states WHERE hash=? AND expires_at>?').run(hash,now());
  return result.changes===1;
}
export function createSession(db,userId,hash,csrf){
  db.prepare('DELETE FROM sessions WHERE expires_at<?').run(now());
  const expires=now()+3*24*60*60*1000;
  db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(hash,userId,csrf,expires);return expires;
}
export function findSession(db,hash){
  return db.prepare('SELECT u.*, s.csrf,s.expires_at AS session_expires FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.hash=? AND s.expires_at>?').get(hash,now());
}
export const publicUser=u=>({id:u.id,name:u.display_name,githubLogin:u.github_login});
export function getUserProfile(u,role){
  return {id:u.id,name:u.display_name,githubLogin:u.github_login,githubId:u.github_id,role,status:u.status,adultAttested:!!u.adult_attested,codeVersion:u.code_version,creativeBio:u.creative_bio,
    creativeDisciplines:JSON.parse(u.creative_disciplines||'[]'),creativeTags:JSON.parse(u.creative_tags||'[]'),openToCollab:!!u.open_to_collab,openToMentor:!!u.open_to_mentor};
}
export function listActivities(db,kind,viewer){
  let rows=db.prepare(`SELECT a.*,u.display_name AS author_name FROM activities a JOIN users u ON a.author_id=u.id
     WHERE a.kind=? AND (a.status='approved' OR a.author_id=? OR ?=1)
     ORDER BY a.created_at DESC LIMIT 80`).all(kind,viewer?.id||'',viewer?.privileged?1:0);
  return rows.map(a=>({id:a.id,kind:a.kind,title:a.title,summary:a.summary,category:a.category,status:a.status,
    authorName:a.author_name,authorId:a.author_id,startsAt:a.starts_at,generalLocation:a.general_location,createdAt:a.created_at,updatedAt:a.updated_at,
    approvedBy:a.approved_by?true:false}));
}
export function createActivity(db,kind,author,body){
  const id=randomUUID();const t=now();
  db.prepare(`INSERT INTO activities (id,kind,author_id,title,summary,category,starts_at,general_location,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id,kind,author,body.title,body.summary,body.category,body.startsAt||null,body.generalLocation||null,t,t);
  audit(db,author,'created_proposal',kind,id);return id;
}
export function updateActivityReview(db,id,reviewer,status){
  const target=db.prepare('SELECT * FROM activities WHERE id=?').get(id);
  if(!target)return false;
  db.prepare('UPDATE activities SET status=?,approved_by=?,updated_at=? WHERE id=?').run(status,reviewer,now(),id);
  audit(db,reviewer,'review_'+status,target.kind,id);return true;
}
export function listCreativeProfiles(db,discipline='',viewerId=''){
  const rows=db.prepare(`SELECT id,display_name,creative_bio,creative_disciplines,creative_tags,open_to_collab,open_to_mentor FROM users
    WHERE status='active' AND (open_to_collab=1 OR open_to_mentor=1)
    AND NOT EXISTS (SELECT 1 FROM member_blocks b WHERE (b.blocker_id=? AND b.blocked_id=users.id) OR (b.blocker_id=users.id AND b.blocked_id=?))
    LIMIT 120`).all(viewerId,viewerId);
  return rows.map(u=>({id:u.id,name:u.display_name,bio:u.creative_bio,disciplines:JSON.parse(u.creative_disciplines),tags:JSON.parse(u.creative_tags),collaboration:!!u.open_to_collab,mentoring:!!u.open_to_mentor}))
    .filter(u=>!discipline||u.disciplines.includes(discipline));
}
export function listConnections(db,viewerId){
  return db.prepare(`SELECT c.id,c.message,c.status,c.created_at,c.requester,c.recipient,
    u1.display_name AS requester_name,u2.display_name AS recipient_name
    FROM connections c JOIN users u1 ON c.requester=u1.id JOIN users u2 ON c.recipient=u2.id
    WHERE c.requester=? OR c.recipient=? ORDER BY c.created_at DESC LIMIT 80`).all(viewerId,viewerId)
    .map(x=>({id:x.id,message:x.message,status:x.status,createdAt:x.created_at,requesterId:x.requester,recipientId:x.recipient,requesterName:x.requester_name,recipientName:x.recipient_name}));
}
export function getDashboardStats(db){
  return {members:db.prepare("SELECT count(*) AS n FROM users WHERE status='active'").get().n,
    proposed:db.prepare("SELECT count(*) AS n FROM activities WHERE status='proposed'").get().n,
    approvedProjects:db.prepare("SELECT count(*) AS n FROM activities WHERE kind='project' AND status='approved'").get().n,
    activeCreatives:db.prepare("SELECT count(*) AS n FROM users WHERE status='active' AND (open_to_mentor=1 OR open_to_collab=1)").get().n};
}
