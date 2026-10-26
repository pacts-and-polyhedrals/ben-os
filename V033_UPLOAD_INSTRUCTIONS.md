# B.E.N. OS v0.3.3 — evidence and live-status bridge (first integration increment)

**This bundle is not yet installed in GitHub or Cloudflare.** It preserves the
working v0.3.2 founder login and adds a public, read-only staging status check,
more accurate P01–P06 evidence, and the WhatsApp ACT-013 clarification.

## What to upload

Extract this ZIP. Upload the files to their **matching paths** in the existing
`pacts-and-polyhedrals/ben-os` repository on `main`. Upload the *files*, not
this ZIP. GitHub may display a replacement warning for existing files.

- **Root:** `cloudflare-worker.mjs`, `README.md`.
- **config/** `module-delivery-status.json`, `roadmap-modules.json`,
  `launch-actions.json`.
- **site/** `app.js`, `index.html`, `styles.css`.
- **docs/** `BUILD_STATUS.md`, `DELIVERY_TRACKER.md`,
  `RELEASE_ROADMAP.md`, `DRIVE_SYNC_DESIGN_v0.3.3.md`.
- **tests/** `cloudflare-auth.test.mjs`, `cloudflare-founder.test.mjs`,
  `public-build-status.test.mjs`.

Don't upload an old copy of `wrangler.jsonc`, `ben-founder-schema.sql`,
existing static `dist/`, or any credentials. The current Cloudflare variables,
D1 tables and GitHub App callback require **no changes** for this patch.

## Safer deployment sequence

1. Upload and commit only `cloudflare-worker.mjs` first. Cloudflare should build
   v0.3.3 automatically. Check both `/api/health` and
   `/api/public-build-status`; the latter must report `driveConnected:false`
   and `certification:not-assessed`.
2. Then upload the `config/`, `site/`, `docs/` and test files preserving paths.
   GitHub Actions `npm test` regenerates the static `dist/` Pages artifact and
   should publish the updated roadmap. Verify the Pages status and founder login.
3. If a deployment fails, roll back to the previously approved v0.3.2 Worker
   deployment in Cloudflare. Do not delete D1 data or change OAuth secrets.

## Expected behaviour

- GitHub Pages still identifies itself as a **public preview**, not a public
  membership portal. Its roadmap displays dated progress evidence for P01–P06.
- On GitHub Pages, P02/P03/P04 run a public **read-only** Cloudflare status
  probe. It contains no member information or private document URLs.
- P01–P06 all remain **prototype_partial**, because release acceptance and
  independent controls have not yet been completed. Their operational
  milestones are now visible, with outstanding gates listed explicitly.
- Founder login, task update and audit remain protected on the Worker.
- ACT-013 and M03 now clarify that WhatsApp hosts the discussions; the site
  will eventually offer a controlled group directory, not 16 duplicated chats.

## What is NOT delivered by this first increment

The Google Drive **two-way connector**, real AI model, Google OAuth consent,
Google Drive document conversions, live member services, production security
certification and automatic policy adoption are **not** part of this patch.
See `docs/DRIVE_SYNC_DESIGN_v0.3.3.md` for the scoped next integration steps.

## Verification already performed

Locally tested with Node 22.16: **37 automated tests passed**, including old
founder authentication/session workflows and new public-status checks.
These code tests do not prove external deployment, accessibility, complete
security or formal Board adoption.
