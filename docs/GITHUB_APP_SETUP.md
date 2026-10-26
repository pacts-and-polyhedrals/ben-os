# GitHub-first B.E.N. OS setup: identity without repo membership

**Working build instructions · 26 October 2026.** This code is a developer pilot, not ready for the general public or sensitive data. Test on a temporary HTTPS staging domain before launch.

## A. The three different concepts

1. **GitHub sign-in = identity.** A member authorises the B.E.N. GitHub App to establish their GitHub's stable numeric user ID. This does not add the member to a GitHub organisation or repository.
2. **B.E.N. site role = application permissions.** A member can submit proposals and participate via the website. A steward or founder, explicitly allowlisted by numeric GitHub ID, can use designated admin routes. These roles are operational permissions, not formal CIC voting or governance status.
3. **GitHub App installation = server's restricted repo permissions.** This is a separate short-lived token minted on the server, scoped to the installed repository and `Issues: Read and write`. Only narrowly reviewed proposals can be converted into issues. The logged-in member's GitHub token is **never** used as a repository write credential.

GitHub recommends GitHub Apps over legacy OAuth apps because they provide fine-grained permissions and expiring installation tokens. B.E.N. uses the GitHub App user authorisation flow for sign-in and a separate installation token for server operations.

## B. Prepare the GitHub organisation and repository

In the founders' GitHub organisation (or temporarily your own account if no organisation exists), create a **private** repository such as `ben-os`. Do not use a public repository for personal member records, passwords, OAuth tokens, casework or unpublished private documents.

From the extracted `BEN_OS_v0.3` folder on your computer (PowerShell):

```powershell
node --version
npm test
git init -b main
git add .
git commit -m "B.E.N. OS v0.3 secure member and creative pilot"
gh auth login
gh repo create YOUR_ORG/ben-os --private --source . --remote origin --push
```

For an existing repository use `git remote add origin ...` and a reviewed pull request instead of overwriting existing branches. Replace `YOUR_ORG` with the real organisation name. The code has not been uploaded by this package.

Protect `main`, require pull-request reviews and CI, enable secret scanning if supported, add two recovery-capable administrators, use MFA and store secrets outside Git. Record the approved deployment and rollback process before production.

## C. Register one GitHub App

1. GitHub avatar → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**. Organisations can register an app through their organisation developer settings.
2. Name it e.g. `BEN Community OS (staging)`. Set its homepage to the actual HTTPS B.E.N. application URL.
3. Set the callback URL to `https://YOUR_APP_HOST/auth/github/callback`. For local testing, if supported by your registration, use `http://127.0.0.1:8787/auth/github/callback` on a separate development app.
4. Enable user-to-server authorisation so members can sign in. Start with the minimum account access needed to retrieve identity; never ask a member for `repo` scope or invite them as a code collaborator just to join.
5. For the optional GitHub Issues bridge, set repository permissions to **Metadata: Read** (implicit) and **Issues: Read and write** only. Disable unrelated write permissions, organisation management and member administration. Do not request Actions/Contents/Administration write.
6. Choose **Only on this account** or the desired distribution policy, then install the app on **selected repositories only**, selecting the non-sensitive `ben-os` repo. Check the installation ID.
7. Generate the App's private key and store it in a secure location outside the repository. Copy the **App ID**, **Client ID** and generate a **Client Secret**. Do not commit or screenshot them into public channels.
8. Create a separate production GitHub App and secrets if hosting the production member service. Do not share development keys across environments.

Official references:
- https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-login-with-github-button-with-a-github-app
- https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app
- https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app

## D. Configure local environment

Use Node.js **24** for a more mature built-in SQLite API (Node 22 supports `node:sqlite` with an ExperimentalWarning; Node 20 does not support this build). Copy `.env.example` to your own **untracked** `.env` for reference, then set the following as real environment variables using your shell/host platform. This simple server does not automatically load `.env`.

```powershell
$env:BEN_BASE_URL="http://127.0.0.1:8787"
$env:HOST="127.0.0.1"
$env:PORT="8787"
$env:GITHUB_CLIENT_ID="YOUR_GITHUB_APP_CLIENT_ID"
$env:GITHUB_CLIENT_SECRET="YOUR_GITHUB_APP_CLIENT_SECRET"
$env:BEN_FOUNDER_GITHUB_IDS="1234567,2345678"
$env:BEN_STEWARD_GITHUB_IDS=""
$env:BEN_DB_PATH=".local/ben.sqlite"
$env:BEN_MODEL="qwen3:4b-instruct"
```

The example numeric IDs above are **placeholders**. To find each founder's stable GitHub numeric ID (after permission/identity confirmation):

```powershell
gh api users/GITHUB_USERNAME --jq .id
```

Put only actual authorised founders' immutable numeric IDs in the allowlist; **a similar username is never enough**. Configured founder/steward identities have access to administrative development routes, independent of their code-repository permissions. Treat that allowlist as temporary technical authorisation—not a formally elected governance role. Rotate it and confirm a human-authorised decision before changing access.

Optional GitHub issue bridge (not required for member sign-in):

```powershell
$env:BEN_GITHUB_APP_ID="APP_NUMERIC_ID"
$env:BEN_GITHUB_INSTALLATION_ID="INSTALLATION_NUMERIC_ID"
$env:BEN_GITHUB_PRIVATE_KEY_PATH="C:\\secure\\ben-app.private-key.pem"
$env:BEN_GITHUB_REPOSITORY="YOUR_ORG/ben-os"
```

The private key must be protected by the host OS. The backend creates its own short-lived installation token; ordinary member sessions cannot see it.

## E. Run the build locally

```powershell
npm test
npm run build:site
ollama pull qwen3:4b-instruct
npm start
```

Then visit `http://127.0.0.1:8787`. Note: Ollama model identifiers and model licensing should be checked against the actual installed version. If Ollama is offline the creative exercises, reference library, member directory and founder tools still operate, but B.E.N. chat shows an availability error.

## F. Do not enable open membership until the real founding steps are complete

By default, a new GitHub sign-in creates a **pending** profile. The application deliberately does not activate member services until both configuration controls exist:

```powershell
$env:BEN_SIGNUPS_ENABLED="true"
$env:BEN_ADOPTED_CODE_VERSION="BEN-02-vX.Y-real-adopted-version"
```

**Never enter these values just to give a misleading appearance of adoption.** Founders first must actually adopt rules, confirm safety/reporting/appeals routes, privacy arrangements, incident response, identity and access policies and pilot scope under the organisation's applicable rules. The app records a self-attestation for age 18+; it does NOT verify age or prevent a determined minor from lying. Higher-risk activities require additional safeguards.

The database is currently local SQLite and is appropriate for developer evaluation, **not** for public multi-server operations or sensitive safeguarding cases. Before public launch migrate to properly managed PostgreSQL, encrypted backups, secure operational logging, verified membership/onboarding, accessibility audits and a separately permissioned casework system.

## G. GitHub Pages vs authenticated B.E.N. OS

**GitHub Pages is static hosting, not a secure identity backend.** Do not put GitHub Client Secret, private keys or user records in Pages JavaScript. Even if the source repository is private, Pages sites may be publicly available.

- Public brochure or static curriculum preview: suitable for Pages after privacy/source review.
- Sign-in, membership, session cookies, private database, AI gateway and founder console: must run behind a separate HTTPS application backend (Node server in this prototype).
- Because v0.3 uses same-origin `fetch('/api/...')` and HTTP-only session cookies, host the interactive site **and its API on the same protected app origin**. The static GitHub Pages preview intentionally does not provide working sign-in.

## H. Secure rollout checklist

- [ ] Six founders review identity of admin allowlist and approve technical custodians.
- [ ] Reviewed Charter/Code, reporting channels, independent appeals and privacy notices actually adopted.
- [ ] GitHub App callback and deployment domain HTTPS, credentials server-only.
- [ ] Least-privilege selected-repository installation and MFA for founders.
- [ ] Authentication, CSRF, session expiration, role denial and cross-user data tests pass.
- [ ] Production DB, backups/restore, rate limiting, monitoring and abuse response completed.
- [ ] No live sensitive records or children under 18 in this prototype.
- [ ] Full license and ownership decisions ratified before open-source release.
- [ ] A trained human supervises published activities, moderation and significant actions.

### Where members edit things

Members use the **website** to update their own creative profile, request an introduction, propose a project/event, offer/ask for help and submit community proposals. These writes go into an access-controlled application database. A separate, explicitly authorised steward can review and approve public listings. Only an approved, non-sensitive proposal that is explicitly confirmed by another steward may be published to the GitHub issue tracker through the server GitHub App.

This is the answer to the original concern: **members can sign in with GitHub without having any direct GitHub repository editing rights.**
