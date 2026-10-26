# GitHub-first setup — Windows / PowerShell

Everything operational in this starter is designed around GitHub: repository history for version control, GitHub Issues for actions, GitHub Projects for the board, pull requests for changes, Actions for automated tests. Existing Drive files remain *source material* until an approved migration. Sensitive casework is **not** safe to migrate into ordinary GitHub Issues or even a broadly accessible private repo.

## A. Make a private organisation repository

1. Sign in at https://github.com and decide whether B.E.N. should own a dedicated **GitHub organisation** (recommended for succession). Create one at https://github.com/organizations/plan if needed. The organisation name is your choice; no organisation was created by this starter.
2. Confirm who among the six founders should administer the GitHub organisation. GitHub's administrator permission is a technical necessity, **not** an extra organisational vote. Set recovery accounts and 2FA. Use individual accounts and the minimum necessary permissions.
3. Install [Git](https://git-scm.com/downloads), [GitHub CLI](https://cli.github.com/), [Node.js](https://nodejs.org/) version 20 or later and [Ollama](https://ollama.com/download).
4. Extract this ZIP into a folder, e.g. `C:\Projects\ben-ai-github-starter`. In PowerShell, `cd` into that folder.
5. Run the commands below, replacing `YOUR_ORG` with the verified GitHub organisation login. If you are using a personal account instead, replace it with that login.

```powershell
npm test
git init -b main
git add .
git commit -m "Initial B.E.N. GitHub-first prototype"
gh auth login
gh repo create YOUR_ORG/ben-os --private --source . --remote origin --push
```

If `gh repo create` says the repository already exists, **do not overwrite it**; inspect its history and reconcile your files via a new branch/PR. If Git complains about missing name/email, configure your own identity with `git config --global user.name` and `git config --global user.email` first. Do not paste tokens into commands or commit them.

**Why private first?** The source registry references permissioned Drive documents; proposed policy, unreleased organisational direction and work-in-progress permissions should be audited before any public release. The public website should ideally live in a separate, explicitly public `ben-site` repository.

## B. Configure collaboration in GitHub

1. In the organisation, create a **Stewards** team or equivalent; invite the verified founders using GitHub's own account invitations. Set access per responsibility, not status or popularity. The technical GitHub team isn't the B.E.N. Board.
2. In the `ben-os` repo, open **Settings → Rules → Rulesets** (or branch protection) and protect `main`: require PRs, require the `test` CI check, prevent force pushes and require at least two code reviewers if available to your plan. Require approval from a code owner where practical. Do not equate a PR review count with a Charter adoption vote.
3. Under **Settings → General → Features**, enable Issues, Projects and Discussions as useful. Keep Discussions limited to non-sensitive, appropriate topics.
4. Under **Settings → Actions → General**, allow trusted Actions and keep the `GITHUB_TOKEN` permissions minimal. The shipped CI workflow uses read-only repository permissions.
5. Agree a process for community proposals, conflicts and the independent appeals route *before* collecting member data. Do not nominate the AI as an appeal reviewer.

## C. Import the existing launch checklist as GitHub Issues

```powershell
npm run seed:preview
npm run seed:apply
```

- Preview only prints the **22 proposed** ACT-001..ACT-022 tasks.
- Apply uses your authenticated `gh` CLI and the current repository's remote. It checks existing issue titles to avoid duplicate ACT IDs.
- These are **starter suggestions from the dated working workbook**, not confirmed live assignments or completion statuses.
- Assign actual owners, due dates, decisions and evidence only after checking with the founders. Leave unverified fields empty.
- If a script reports a partial error, inspect the GitHub Issues list; re-running is designed to skip existing ACT IDs.

## D. Create the GitHub Project board

1. Open the B.E.N. GitHub organisation → **Projects → New project → Board**.
2. Name it `B.E.N. | Founding & Pilot` and set visibility to **private** while policies are draft.
3. Add the Issues from `ben-os` and create fields: `Status` (Proposed, Ready, In progress, Review, Blocked, Done), `Workstream`, `Priority`, `Owner`, `Backup`, `Target date`, `Policy reference`, `Decision ID` and `Evidence link`.
4. Create useful views: `Launch gates`, `Governance`, `Safety & privacy`, `CIC roadmap`, `Pilot`, `AI development`.
5. Ensure a Project status or 'Done' label **never** means an approved vote. Use a separately minuted, permission-appropriate decision record with `DEC-YYYY-NNN` ID.
6. Keep the user-visible dashboard's action snapshot clearly historical until an authenticated GitHub Issues read integration is reviewed and added.

## E. Run B.E.N. AI locally

In PowerShell:

```powershell
ollama pull qwen3:4b-instruct
npm start
```

Open http://127.0.0.1:8787. Ollama must already be running (the Ollama desktop app starts its local service on many systems). If you change the model:

```powershell
$env:BEN_MODEL="qwen3:4b-instruct"
npm start
```

The app calls the local Ollama endpoint at `http://127.0.0.1:11434`. It currently cannot create GitHub issues itself or read live Drive content. It can create copyable Issue drafts and B.E.N. Test records.

**DO NOT** expose port 8787 or your Ollama port directly to the internet. This prototype is localhost-only and has no public authentication, session controls, rate limiting, prompt-abuse monitoring, independent production safety evaluation or protected online secrets.

## F. GitHub Pages (optional, public, not the AI backend)

This is **deliberately not enabled by default**. Once the founders have approved public wording and reviewed source visibility:

1. Create a separate **public** repository for the public-facing site on GitHub (recommended). Copy only the vetted `dist/` output, not `config/source-registry.json`, operational or casework data.
2. Alternatively, if publishing this repository is appropriate for your plan, rename `.github/workflows/pages.yml.example` to `.github/workflows/pages.yml` and commit via a reviewed PR.
3. Go to repo **Settings → Pages → Source → GitHub Actions**. Confirm public visibility of the resulting website and review the deployed files.
4. GitHub Pages hosts static assets. It **cannot** securely run Ollama or store private model credentials. The Pages copy will show 'Static GitHub preview' and will not pretend to be a working public chatbot.

GitHub's documentation notes that Pages sites are publicly accessible even where some private repositories are eligible to publish Pages; see https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site.

## G. Future production backend

For a public B.E.N. assistant, adopt an authenticated HTTPS backend, model hosting, strict service credentials, cost/rate limits, consent and data retention policy, a protected API domain and independent evaluation before enabling real users. GitHub remains the source of code, PRs and Actions, **not** a substitute for a production execution environment. Proposed cloud integration must go through human code review and privacy impact review.

## H. Six-founder first meeting checklist

Use original **BEN-07 T01**: read the proposed Charter, Code and Governance together; resolve amendments; record six-seat attendance and conflicts; apply the reserved four-yes threshold if approved; appoint leads/backups, Governance reviewers, reporting and independent appeal routes; verify permissions, MFA and launch blockers. This GitHub starter does **not** constitute the founding vote and should not be represented as official approval.
