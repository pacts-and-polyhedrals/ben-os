# B.E.N. OS — controlled two-way Drive and website synchronisation

**Design candidate for the next integration build, reviewed 26 October 2026.**
**Not yet configured, connected, or authorised.** `0.3.3`'s immediately deployable
status bridge exposes only non-sensitive live staging checks and updates the old
P01–P06 progress descriptions. This document describes the separate implementation
and consent gates needed for real Google Drive writes.

## The source-of-truth rule

- **Google Drive working documents:** the maintained copies of draft policies,
  meeting minutes, source material and their revision history. The original
  BEN-00–07 `.docx` files and Control Centre `.xlsx` are *stored Office files*,
  not native Google Docs/Sheets. Don't pretend that the Google Docs editing API
  can modify their internal paragraphs and cells in-place. Keep originals until
  explicitly choosing and verifying native working copies.
- **Cloudflare D1:** user sessions, operational actions, evidence review, approved
  decisions, metadata, permissions, sync receipts and audit logs. A task status
  in D1 does not itself constitute a valid board decision.
- **GitHub:** non-sensitive source code, CI runs, verified engineering evidence,
  issue IDs and releases. Never raw complaints, member files or secrets.
- **Public website:** a strictly approved, privacy-safe **projection** of those
  sources. It may show verified service health and public summaries, never an
  unrestricted view of Drive documents or private D1 rows.
- **AI:** proposal and research assistant. It cites exact source file/revision
  and passage, extracts candidate follow-ups, and requests human confirmation
  for writes. It never adopts policy or generates a vote result.

## Stage A — live technical status bridge (code in 0.3.3 candidate)

1. Deploy a `GET /api/public-build-status` endpoint on the Cloudflare Worker.
2. The GitHub Pages roadmap fetches that endpoint without sessions or tokens.
3. Show P02–P04 as **staging online** only when backend, founder login configuration
   and D1 table checks actually pass. Other modules show explicitly dated evidence.
4. **Do not** change any P module to `verified_complete` merely because a URL works.
   Each module has outstanding acceptance and recovery/security/approval gates.
5. The live probe discloses no member data, private Google Drive URLs, GitHub IDs,
   Cloudflare credentials, unpublished policies or casework.

## Stage B — connect a restricted B.E.N. Drive workspace

1. Founders select a dedicated B.E.N. folder and named account custodians.
   Classify each document as `public_draft`, `steward_internal` or
   `restricted_separate`. **Never connect Restricted Casework** to general AI.
2. Create a B.E.N.-controlled Google Cloud project and enable Drive, Docs and
   Sheets APIs only as required. Obtain a **distinct** Google OAuth authorisation
   for the B.E.N. Worker. The Google Drive connection in ChatGPT is not a reusable
   credential for independently hosted Workers.
3. Prefer `drive.file` with a deliberate Google Picker file selection, or an
   explicitly shared narrow service-account workspace. Never request blanket
   full-Drive access simply because it is easier. Store tokens only in Cloudflare
   secrets with restricted access, never the public repo, Pages or D1 notes.
4. Convert *copies* of selected Office policy masters to native Google Docs and
   the task/action workbook to a dedicated native Google Sheet, preserving the
   original source URLs and version history. Check formatting and formula
   parity before declaring them the live working masters.
5. Save stable source IDs, file IDs, resource versions, types, roles and update
   permissions in restricted D1 tables. Missing access is an error, never an
   invitation to broaden OAuth scope.

## Stage C — source-aware inbound updates (Drive -> OS)

- Poll `changes.list` with a stored start-page token, or use vetted
  change-notification channels with renewal. Do not scan every file on every
  visitor request.
- A changed approved file produces a hash/versioned `sync_event` with source ID,
  title, changed time, rights label and authorised reviewer, then an extraction
  **proposal**. Use deduplication keys `(file_id, revision, proposal_kind)`.
- Match candidate actions to the existing ACT IDs; preserve the exact passage,
  meeting timestamp and nuance: discussed, suggested, agreed by those present,
  formally adopted, and completed are **different states**.
- Apply safe technical metadata updates automatically (e.g. file revision,
  healthy endpoint). For substantive action/status changes, show a diff to an
  authorised reviewer. For Board decisions require independently recorded
  quorum/recusal/vote evidence, not a Gemini summary saying 'agreed'.
- Concurrency: on mismatch between Drive revision and expected D1 version,
  mark `conflict_for_review` and do not overwrite either side.

## Stage D — controlled outward updates (OS -> Drive)

- Export approved operational action status rows (ACT ID, owner, progress,
  evidence pointer, updated timestamp and source provenance) to a **sync-owned**
  native Google Sheet, not by overwriting whole Office documents.
- A founder's approved amendment produces a Google Doc **suggested revision** or
  change request to its working copy. The adopted version remains immutable
  until a valid, minute-backed adoption event is attached.
- A write needs an explicit actor, scope, target file, expected revision/ETag,
  rights check, diff preview, idempotency key and audit record. Exclude private
  notes and personal identifiers from public outputs.
- After writing, read the affected Drive range/document version back; log the
  result, and mark failures as pending. Ignore our own mirrored events on the
  next poll using the saved origin+revision ID to prevent loops.

## Stage E — safe public site projection and AI assistance

- Generate public Pages/Worker JSON only from `approved_public` documents and
  approved summaries. The publish workflow checks redaction and authorisation.
- The AI may answer founder questions with citations to source ID, version and
  paragraph, but must explain when a policy is merely proposed.
- The member AI receives only member-permitted published materials; no private
  full-text Drive search, no general casework access and no 'training' on
  private member stories. Creative assistance remains human-first.
- Every significant AI write is a reviewable change proposal with a human
  approve/reject action and immutable audit event.

## First integration acceptance test

**Source:** 8 October 2026 meeting notes (speaker labelled 'Ben Network';
identity not independently verified as 'Ben Park Life').

**Expected result:** the AI proposes replacing ACT-013's fixed 16 WhatsApp-group
launch with the smaller core community groups discussed in the meeting. It links
back to the original notes and flags the current policy/roadmap mismatch. It
**does not** publish additional groups, claim the whole Board voted, or rewrite
BEN-02/03/05 without a documented human approval.

**Second test:** a human edits a safe non-sensitive task note in the sync-owned
Google Sheet. After change detection, D1 shows a candidate diff. An authorised
founder approves it, D1 updates and the audit trail records both sides. A
simultaneous conflicting edit must produce a review item, never data loss.

## What must be in place before describing Drive as connected

- Named Drive custodians and approved per-file permissions.
- Google OAuth/service account set up, correctly scoped and stored as secrets.
- File-type conversion or explicitly limited read-only handling for `.docx`/`.xlsx`.
- Worker sync schema, encrypted credential handling, retries, rate/quotas and logs.
- Conflict protection, source attribution, human write approval, retention model.
- Tests showing live change in **both directions** and no secret/private leaks.

**Non-goals:** autonomous policy adoption, unreviewed file overwrites, WhatsApp
chat monitoring, broad ingestion of personal Drive, real-time edit replication
of the existing Office binaries, and opening public membership.
