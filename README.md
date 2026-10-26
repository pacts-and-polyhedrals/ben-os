# B.E.N. OS — Be Even Nicer

**Benevolent Energy Network · v0.3 developer prototype · 26 October 2026**

B.E.N. OS is a human-led community portal plus a discipline-aware creative mentor, built around the ten founding principles of the Benevolent Energy Network. It is **not** an autonomous governor, an artistic output factory or a social-credit system.

## What it does today

- GitHub App sign-in establishes identity, **not GitHub repository access**. A server-only installation token can separately access a specifically authorised GitHub issue tracker. Founder/steward site access is granted only to exact immutable numeric GitHub IDs configured by technical custodians.
- Human-first creative curriculum spanning **48 creative disciplines** with five coaching modes, exercises, techniques and open-licensed artwork references.
- Interactive, mobile-responsive public gallery of the charter, the B.E.N. Test, an ethics overview and the 53-module roadmap.
- Member prototype: gated registration, opt-in creative profiles, collaborator directory and private invitations, community proposals, projects, help offers/requests, gatherings, private gratitude and data export/deactivation.
- Founder prototype: source-linked actions, saved task progress notes, review queue and optional GitHub Issues bridge. **No policy adoption, legal votes, restricted casework or spending** can be authorised by this software.
- Optional locally configured Ollama model for creative mentoring and community assistance; no chat transcript stored in the B.E.N. database by default.

## Status and ethical boundaries

All October 2026 founding policies from Drive remain **proposed** unless a real, recorded founding decision confirms their adoption. Member registration defaults to OFF. A GitHub sign-in creates a pending user, not an automatic member or GitHub collaborator. The public app is NOT production-ready; `node:sqlite` is used as a development datastore and requires a compatible Node version. Do not put sensitive safeguarding reports, payment details, medical histories or real credentials in this prototype.

**Licensing is pending founder approval.** Source disclosure does not itself confer a software redistribution licence; `package.json` deliberately says `UNLICENSED`. Review [open-source options](docs/OPEN_SOURCE_STRATEGY.md) before public release.

## Get started (Windows PowerShell)

Install Node.js **24**, GitHub CLI, and optionally Ollama. Unzip the project and open PowerShell in its root:

```powershell
npm test
npm run build:site
npm start
```

Open http://127.0.0.1:8787. Without a GitHub App you can browse the public static studio and curriculum, but actual sign-in remains unavailable. Without Ollama, AI chat is unavailable but the exercises still work.

To inspect the creative mentor evaluation plan without running a model, run `npm run eval:creative`. The 57 cases are unscored until a qualified human reviews actual responses.

For **real GitHub sign-in**, read **[GitHub App setup](docs/GITHUB_APP_SETUP.md)**. It shows which credentials to create, exactly how to configure founder access, why members do not touch the repo, and why GitHub Pages alone cannot provide a protected authenticated backend.

To enable an optional local AI model:

```powershell
ollama pull qwen3:4b-instruct
npm start
```

The model identifier is a suggested configuration string, not a guarantee of expertise or rights. Confirm its current installation and license locally.

## Documentation

- [AI Ethics Charter](docs/AI_ETHICS_CHARTER.md)
- [Plain-language AI ethics statement](docs/ETHICS_AT_A_GLANCE.md)
- [Human-first creative arts charter](docs/CREATIVE_EDUCATION_CHARTER.md)
- [Open-source and licensing strategy](docs/OPEN_SOURCE_STRATEGY.md)
- [GitHub App sign-in + organisation setup](docs/GITHUB_APP_SETUP.md)
- [Build implementation status and incomplete production controls](docs/BUILD_STATUS.md)
- [53-module execution tracker, actual completion status](docs/DELIVERY_TRACKER.md)
- [48 discipline creative education workpackets](docs/CREATIVE_EXPERTISE_PROGRAMME.md)
- [Model card](docs/MODEL_CARD.md)
- [Master 53-module specification](docs/MASTER_MODULE_BLUEPRINTS.md)
- [Release sequencing and GitHub-first implementation runbook](docs/RELEASE_ROADMAP.md)
- [Contributing as a developer or creative educator](docs/CONTRIBUTING.md)
- [Existing v0.1 constitution and governance guidance](docs/AI_CONSTITUTION.md)

## Organisation of the code

```text
src/auth.mjs             GitHub App web sign-in, session and roles
src/db.mjs               SQLite development schema, prepared queries and audit events
src/server.mjs           HTTP, JSON, activity/community and steward routes
src/creative.mjs         Human-first curriculum, model guidance and Met CC0 references
src/github-bridge.mjs    Short-lived GitHub App installation token; restricted issue actions
src/knowledge.mjs        Existing BEN-01 / BEN-07 proposal-grounded knowledge
site/                     Public and authenticated single-page web app
config/creative-curriculum.json  Original 48-discipline educational scaffolds
config/roadmap-modules.json      Original 53-module full-program backlog
.github/workflows/        CI tests
```

### Human approval not a checkbox

A saved project, completed task, accepted website form, GitHub issue or AI answer is not a legal resolution. Any formal Board action still needs the correct humans, quorum, conflicts check, notice and recorded vote under adopted policy. The AI has no independent authority.

### Privacy

Only ordinary member records are stored in local SQLite for development, never in the public GitHub website bundle. OAuth secrets remain server-side. Creative opt-ins can be revoked. Private creative journal notes are saved in the development database, which its operator can access. No member profile gets a kindness/virtue score. Direct member-to-member email addresses are never placed in directory results.

### Development model

Preserve v0.1 as the baseline. Make changes through focused pull requests, pass regression tests, and document unresolved limitations. Follow `docs/BUILD_STATUS.md` for remaining engineering and operational gates. **Do not deploy open registration until the founders have actually adopted the policies and independently tested safeguarding, privacy, security and accessibility.**

## Cloudflare Staging

B.E.N. OS uses Cloudflare Workers and D1 for
its staging backend. Public membership remains
disabled while authentication is tested.
