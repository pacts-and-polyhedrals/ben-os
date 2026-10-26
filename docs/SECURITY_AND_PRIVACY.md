# Privacy, security, and the limits of GitHub

**Default: local-only prototype, no live users, no external model provider.** The Node server binds to `127.0.0.1`, and the AI request goes to a configured Ollama endpoint. The frontend uses `textContent` to display model replies to limit HTML injection. HTTP input has bounds, but this is **not** independently security-audited or production-ready.

## Classify everything before importing

| Type | Place | Never put in |
|---|---|---|
| Approved public Charter, public programme, vetted site copy | GitHub public website/repo after vote | Unreviewed output bundles |
| Draft procedures, technical work, action IDs, pseudonymous aggregate metrics | Private GitHub operations repo / Projects by role | Public GitHub Pages before review |
| Member contact details, consents, complaint narratives, medical information, identity documents, evidence, recovery codes, personal financial records | Independently permissioned, encrypted restricted system designed for that purpose | GitHub Issues, Discussions, PRs, Actions logs, AI prompt history, public website |

The 1 October 2026 B.E.N. operations pack expressly requires **separate access areas** for public, steward and restricted casework. Even a private repo may be inappropriate for confidential case files because organisation admins, forks, Actions and history can broaden access. Avoid copying case details into an LLM.

## Technical risks / controls for later production

- **Authentication:** add organisation-controlled identity, per-role access and independent human approvals before a hosted API. Never treat a frontend role dropdown as an access control.
- **Secrets:** use GitHub Actions Environments/Secrets for CI when necessary; never use secrets in client JavaScript or Pages. Rotate credentials after departure.
- **Prompt injection:** trusted, human-curated sources only for prototype; isolate untrusted retrieved text, cite and review changes, disallow unreviewed tool execution.
- **LLM mistakes:** treat drafted governance guidance as a draft. Run evaluations, audits and incident response exercises. The model cannot certify approved policy.
- **Privacy:** publish a complete notice, retention criteria and user rights process before real signups; minimise analytics, avoid tracking kindness scores and selling behavioural data.
- **Supply chain:** review model licenses, model digests, dependencies, GitHub Actions permissions and security updates. The initial code has no third-party Node dependencies.
- **Environmental impact:** measure runtime, model size, electricity and cost as deployment scales; use right-sized models before expanding compute.
- **Casework:** keep independent secure channels for safeguarding/appeals; no AI auto-triage of sensitive reports without specialist review, lawful basis and suitable technical controls.

## Public-site warning

A GitHub Pages site can be publicly accessible even when the source repository is private on eligible plans. The optional Pages workflow only publishes `dist/`, whose build strips private Drive source URLs and never includes confidential casework. A source leak in code or Markdown still needs human review before repo publicity. See GitHub's own Pages documentation.
