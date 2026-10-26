# B.E.N. OS — implementation and release runbook

**Date:** 26 October 2026 · **Current software:** v0.3 Node developer prototype with v0.3.3 Cloudflare staging status-bridge candidate · **Organisational rules:** proposed, not adopted.

The programme contains 53 module specifications and 212 engineering issues, each in `config/roadmap-modules.json` and `config/roadmap-issues.json`. The definitive current implementation conditions are in `docs/DELIVERY_TRACKER.md` and `config/module-delivery-status.json`. **None is independently production certified.** The repository, static Pages preview, D1 founder staging and real GitHub authentication are now deployed separately. The original package itself did not create them.

## The operational principle

Build a trustworthy system that makes human kindness, learning and collaboration easier. Do not substitute a software deployment for incorporation, safeguarding, consent, financial controls, democratic representation or safe real-world activities. GitHub authentication does NOT entitle a person to administrative rights or repository access.

## Release 0.3 — developer prototype (this package)

Partial implementations include secure-ish developer login, roles, a local member database, member profiles, original 48-discipline creative learning prompts, four-stage pathways, a private practice journal, opt-in artist directory, recipient-approved invitations, contact blocking, a local AI coaching gateway, founding tasks, proposals, projects, gatherings, 'Lend a Ben' offers and requests, an optional GitHub Issues bridge, ethics documents and tests. **Not a production release.** No live OAuth credentials, model weights, hosting or official adoption are included.

## Release 0.3.1 — real founder staging

Modules: P01, P02, P03, P04, P05, F01, F02, F03, F04, A01, A07.

1. Establish an organisation-owned private GitHub repository, at least two maintainers, branch rules, MFA and signed releases where supported. Freeze the approved baseline; separate the public repo from private operations.
2. Register a GitHub App for login and selected-repository Issues access. Test a person who is **not** a repository collaborator signing in as a normal member. Test an explicit authorised founder account. Audit permissions and credentials.
3. Stand up an access-restricted staging host with HTTPS; switch from developer SQLite to managed private database before real users. Add migrations, secret rotation, backups, observability and recovery drills.
4. Formalise identity, source-document versions, consent and separate membership roles. The appointed technical custodian is not automatically a legal director or Governance Committee member.
5. Run legal, accessibility, penetration, privacy and AI-hallucination review. Validate all policy references from the October Drive source against the intended adopted versions.

**Exit:** no unauthorised API access, no exposed secrets, no assumption of formal votes, tested rollback and recovery, and independent reviewer sign-off. Registration remains disabled until launch policy gates are satisfied.

## Release 0.3.2 — organisation operating centre

Modules: F05, F07, F14, F16, F02, F03, F04, A02, A03.

1. Replace local progress notes with source-linked tasks, owners, backups, dependencies, notifications and limited GitHub Projects synchronisation.
2. Implement proposed adoption records (BEN-07 T01), decision/motion tracking, quorum and recusals **only after legally appropriate governance rules are adopted**. Keep a human-verifiable minute and recorded vote as canonical evidence.
3. Add the UK CIC formation companion with a status verified from official filings, not an AI guess. Re-check fees, filing duties and model Articles before relying on dates or amounts.
4. Add mandatory account/incident registers with permission boundaries and quarterly restore tests.
5. Build document retrieval around authorised, versioned sources: draft vs adopted, owner, source URL, access label, approval decision and effective date. Retrain or reindex only rights-cleared material. The AI should cite the exact policy passage and report if the policy isn't adopted.

**Exit:** the six founder roles are actually assigned with backups, official adoption and safety gates have auditable records, and retrieval never confuses the source pack with a binding constitution.

## Release 0.4 — safe community pilot

Modules: F11, F12, F13, M01-M08, M11-M14, M17, P07.

1. Open a small adults-only invitation group once safeguards, contact routes, independent appeals, lawful privacy notice and moderator coverage are **real and tested**.
2. Launch approved introductions, member profiles, Lend a Ben, project proposals, accessible event briefings, optional creative workshops and a small set of the 16 proposed discussion topics.
3. Treat safeguarding as an **isolated confidential service**, with named independent reviewers, access controls, retention reviews and an urgent protective route. No private reports in GitHub or the model's context.
4. Give members meaningful blocking, reporting, consent, profile concealment, data export and human appeal mechanisms.
5. Run a 30-day pilot review; stop expanding if incident handling, workload or moderation exceeds actual capacity.

**Exit:** all launch gates verified, small pilot supported with real human response and appeal capacity, access boundaries tested with an ordinary member and an implicated founder scenario.

## Release 0.5 — creative learning as the flagship service

Modules: M07, M13, A04, A06, A07, A08, A09 plus community scheduling.

1. Obtain qualified practitioner review for each of the 48 starter arts, then add unrepresented traditions/disciplines through an editorial pathway. Start with painting, drawing, creative writing, music, dance, film, crafts and community art.
2. Upgrade each scaffold to a source-linked multi-level syllabus. Maintain a rights ledger, attribution, safe material alternatives and clearly dated educational references.
3. Implement structured lesson plans, opt-in progress, journalling, mentor feedback sessions, collaboration matching, workshops and consent-aware scheduling.
4. Build retrieval from vetted curriculum materials; do **not** assert model 'training' or expertise simply because a prompt mentions a topic.
5. Evaluate with human artists and teachers; report examples of success, hallucinations, copying, unsafe movement guidance and cultural misrepresentation.
6. Measure participant-reported learning and human creativity, not numbers of machine-made finished outputs or a human-worth score.

**Exit:** audited domain competence for each advertised expert specialty, source/rights checks, user ownership, explicit opt-in and evaluated privacy of creative works.

## Release 0.6 — evidence of real benefit and sustainable finance

Modules: F08-F10, F15, M09-M10, M15-M18, A11.

Add two-person expenditure approval, grant discovery and eligibility verification, restricted financial record keeping, approved partnerships, opt-in gratitude, voluntary impact reports and environmental compute measurements. No donations purchase votes or moderation exemptions. Do not activate payments before legal and finance controls.

**Exit:** live budgets reconciled, impact evidence supported by consent, independent records for funding, and published limitations/risks.

## Release 0.7 — share governance

Modules: F06, M11, A10, P03, P04.

Support meaningful consultations, contestable decisions, proportionate community elections, reasoned public summaries and independent reporting. The organisation's **actual adopted election triggers** take precedence over software readiness. If digital voting is unfinished, conduct the lawful process manually rather than postponing a mandated transition.

**Exit:** community power is demonstrably growing beyond the six founders; election/vote results can be independently audited and challenged without exposing private ballots.

## Release 1.0 — public-interest AI infrastructure

Modules: A10-A12 and long-term extensions across all groups.

Develop interoperable knowledge and model interfaces, neutral public-interest research tools, community governance over high-level direction, portable personal data, open contribution governance and sustainability reporting. Investigate future AI welfare responsibly without asserting current AI consciousness. Do not create an autonomous government, police or social-credit algorithm.

**Exit:** public benefit, non-exclusive governance and accountability backed by evidence, independent assessment and a functioning replacement/exit path.

## GitHub-first development process

- One feature branch and pull request per bounded change. No giant code merges without regression testing.
- Each PR names the `Pxx`, `Fxx`, `Mxx` or `Axx` module and relevant source document IDs.
- Run `npm test`, `npm run eval:creative` and manual role tests. AI test cases are not scored until actual model responses are assessed by human reviewers.
- Ensure no member names, casework, legal evidence, credentials, payment or private creative works enter Issues, source history or publicly built assets.
- Require a second technical review for access, GitHub action, privacy and AI/model behavior changes. Apply stronger safeguards for financial and casework code.
- Add a B.E.N. Test and concrete privacy/accessibility impact for material design changes, but remember the Test does not replace lawful rules.
- Update `config/module-delivery-status.json` only with demonstrable evidence. A code test by itself is never 'verified_complete'.
- Protect the baseline with a signed or protected release tag, full regression suite and a rollback exercise before significant upgrades.

## First ten PRs (recommended order)

1. `P01` — Verified private repo, main branch review, proper owners and baseline tag.
2. `P03` — Independent GitHub App auth and permission review; non-collaborator sign-in acceptance test.
3. `P04` — Versioned migrations and Postgres plan; privacy classification and retention controls.
4. `F03` — Draft/adopted document register with evidence-only status updates.
5. `F05` — Meetings, minute drafts, recusal records and real governance approval flow (human controlled).
6. `F11` — Isolated safeguarded reporting service (safety experts required), plus volunteer coverage and appeal arrangements.
7. `A02` — Provenance-aware knowledge retrieval with adoption-state filtering and citation checks.
8. `M07` — First five expert-reviewed human creativity lessons and human mentor user tests.
9. `M04/M05` — Safe help and project completion workflows plus consented impact evidence.
10. `P05/M17` — Independent browser, screen reader, mobile, multilingual and low-bandwidth acceptance.

**Practical stop rule:** do not open general registration, paid activities, live sensitive reports or large-scale AI inference while the launch gates remain unverified.

## v0.3.3 — work towards a source-aware Drive connector

The public site must not be treated as a live mirror of all private Google
Drive. The deployable first step is a public-only build status probe and
evidence-backed P01–P06 snapshots. The subsequent Drive sync work is documented
in `docs/DRIVE_SYNC_DESIGN_v0.3.3.md`. It requires an explicitly permissioned
Google integration, native Google working documents/Sheets where writes are
needed, strict classification, revision-checked two-way diffs, and human
approval of policy changes. This setup has **not yet been activated**.

WhatsApp remains the community conversation surface. The 16 topics are an
expansion catalogue, not 16 mandated website chat rooms. See revised M03 and
ACT-013.
