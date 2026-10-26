# 03 — Detailed module blueprints

**53 modules** and **212 separately importable GitHub story drafts**. This file is generated from `backlog/modules.json`; update that source then regenerate. All are proposals, not live applications.

## How to read
Every module identifies target release, priority, dependencies, real user journey, major entities, controls, acceptance criteria, next-release ideas and the granular Issues that implement it. P0/P1/P2/P3 classifications are explained in 02_RELEASE_STRATEGY.md.

## Shared platform & engineering

### P01 — GitHub organisation, source control and delivery

**Release:** 0.1.1 · **Priority:** P0 · **Audience:** Founders / developers · **Complexity:** M · **Dependencies:** none · **Document references:** BEN-00, BEN-06.

**Purpose.** Preserve v0.1 as a recoverable baseline and create an accountable multi-person GitHub workflow.

**Journey and behaviour.** Founders select an organisation-owned private repo; enable MFA, at least two recovery-capable org owners, branch rules, CODEOWNERS, mandatory reviews, automated tests and release tags. Each PR names its source and any required human decision.

**Data/contracts.** GitHub Issues/Projects are the canonical non-sensitive development records; the app only projects their status.

**Safety and authority.** An admin permission is not a B.E.N. Board vote. Review Git history and Pages artefacts before publishing; no shared passwords or secrets in commits.

**Release acceptance.**

- v0.1 build reproducible.
- unauthorised direct main push blocked where plan supports it.
- protected release and rollback proven.

**Implementation issues.**

- `P01-01` — Freeze baseline and record test results.
- `P01-02` — Configure GitHub organisation, teams, branch rules and CODEOWNERS.
- `P01-03` — Build and run CI, source scan and rollback drill.
- `P01-04` — Set up project fields and issue workflows.

**Later optional enhancement.** Add signed releases, dependency provenance and a public developer contribution programme after licence approval.

---

### P02 — Production hosting, API and deployment protection

**Release:** 0.1.1 · **Priority:** P0 · **Audience:** Developers / operations · **Complexity:** L · **Dependencies:** P01 · **Document references:** BEN-06.

**Purpose.** Separate public content, authenticated services, restricted casework and AI inference before any live user data.

**Journey and behaviour.** Keep public Pages static; provide a hosted HTTPS API and private inference gateway only after approved vendor/hosting selection. Establish staging, production, backups, health checks, incident on-call coverage and budgets.

**Data/contracts.** Environment configuration and operational telemetry; no personal data in Pages, client bundles or public logs.

**Safety and authority.** No public hosting of v0.1 unauthenticated Node server; least-privilege service accounts, origin checks, rate limits and abuse budgets.

**Release acceptance.**

- Unauthorized API access denied.
- staging data non-production.
- deploy and rollback demonstrated.
- health and error alerts verified.

**Implementation issues.**

- `P02-01` — Choose hosting and capture data processing risks.
- `P02-02` — Introduce authenticated staging API and environment controls.
- `P02-03` — Add rate limiting, metrics and security headers.
- `P02-04` — Exercise release rollback and recovery.

**Later optional enhancement.** Infrastructure-as-code and geographically resilient deployment only after measured need.

---

### P03 — Identity, delegated roles and authorization

**Release:** 0.3 · **Priority:** P0 · **Audience:** Members / stewards / developers · **Complexity:** L · **Dependencies:** P02, P04 · **Document references:** BEN-01, BEN-03, BEN-06.

**Purpose.** Provide inclusive identity for members and strict delegated permissions for stewards without requiring GitHub accounts from everyone.

**Journey and behaviour.** Use OIDC/passkeys or equivalent inclusive methods; verify community membership separately from legal CIC membership and GitHub permissions. Staff MFA, short-lived sessions, role expiry, backups and per-case conflict exclusion.

**Data/contracts.** User, CommunityMembership, StewardAssignment, legal member link (optional) and access audit; never a public directory of legal names.

**Safety and authority.** Deny by default on the backend. Negative tests must cover member/steward/reviewer/implicated founder; no client-only access checks.

**Release acceptance.**

- Every restricted API denies nonauthorised use.
- privileges expire on role exit.
- account recovery works through two authorised custodians.

**Implementation issues.**

- `P03-01` — Design identity and membership distinction.
- `P03-02` — Implement login/session/MFA and server-side role policy.
- `P03-03` — Add steward onboarding/offboarding and conflict recusal.
- `P03-04` — Run cross-role privilege and recovery tests.

**Later optional enhancement.** Later support federation and delegated community identity without data sale.

---

### P04 — Data classification, schemas and ownership

**Release:** 0.2 · **Priority:** P0 · **Audience:** Founders / developers · **Complexity:** L · **Dependencies:** P01 · **Document references:** BEN-00, BEN-06.

**Purpose.** Create reliable records with one canonical home for every domain and no duplication of sensitive information.

**Journey and behaviour.** Define typed IDs, source status, timestamps, classification and allowed destinations. Keep current Drive policy masters until real adoption; GitHub owns non-sensitive Issues; private DB owns identities and event participation; isolated vault owns casework.

**Data/contracts.** PolicyVersion, Decision, GitHubActionProjection, User, Project, Event, Consent, AuditEvent, SafetyReference.

**Safety and authority.** No private allegations, member identifiers, medical conditions or raw financial credentials in ordinary GitHub, model inputs, shared logs or static assets.

**Release acceptance.**

- Schema review documented.
- cross-domain IDs unique.
- forbidden fields blocked at API/import boundary.
- backup restore tested.

**Implementation issues.**

- `P04-01` — Publish canonical data-ownership matrix.
- `P04-02` — Define typed schemas and version migrations.
- `P04-03` — Implement data classification/validation gates.
- `P04-04` — Test duplicate events, data export and restricted-data exclusion.

**Later optional enhancement.** Event-sourced audit and selective data portability for other community organisations.

---

### P05 — Accessible design system and usability

**Release:** 0.2 · **Priority:** P0 · **Audience:** Everyone · **Complexity:** M · **Dependencies:** P01 · **Document references:** BEN-01, BEN-05.

**Purpose.** Turn purple/gold B.E.N. branding into an accessible interface for nontechnical and neurodivergent participants.

**Journey and behaviour.** Auditable component library for navigation, forms, errors, tables, assisted workflows, mobile layouts and plain-language consent. Test real keyboard, screen-reader, zoom and contrast journeys.

**Data/contracts.** Design tokens, components, content style, optional reduced motion/contrast/reading choices.

**Safety and authority.** Brand playfulness (#probablyacult) must never appear in safety/appeals/financial warnings. Avoid gamification that pressures participation.

**Release acceptance.**

- WCAG 2.2 AA targets tested.
- mobile task flow feasible.
- automated and manual accessibility checks run in CI/release reviews.

**Implementation issues.**

- `P05-01` — Create design tokens and accessible component patterns.
- `P05-02` — Audit v0.1 keyboard, mobile and screen reader.
- `P05-03` — Add plain-language form/errors and localization hooks.
- `P05-04` — Publish usability and accessibility regression tests.

**Later optional enhancement.** Installable PWA, low-bandwidth mode and offline draft capture later.

---

### P06 — Public website and approved knowledge portal

**Release:** 0.3 · **Priority:** P0 · **Audience:** Public / members · **Complexity:** M · **Dependencies:** P04, P05, F03 · **Document references:** BEN-01, BEN-05, BEN-06.

**Purpose.** Explain B.E.N. accurately to outsiders with truthful organisational status, safe contacts and accessible published policies.

**Journey and behaviour.** Publish the approved mission, contact channels, programme descriptions, decision summaries and how to join. Show PROPOSED where unadopted; use a separate public output build after document review.

**Data/contracts.** ApprovedPage, PolicyVersion, PublicDecisionSummary, EventSummary; no member roll or permissioned Google Drive links.

**Safety and authority.** Pages content can be public even from a private repository. Verify assets, source/history, consent and publication tier prior to release.

**Release acceptance.**

- Public pages contain only reviewed content.
- links work for unauthenticated visitors.
- contact and privacy routes tested.

**Implementation issues.**

- `P06-01` — Publish approved public information architecture.
- `P06-02` — Create versioned policy and governance pages.
- `P06-03` — Build safe public joining/contact pathways.
- `P06-04` — Test privacy exclusions and Pages deploy.

**Later optional enhancement.** Offer translated accessible guides, impact stories and community maps after consent and safety review.

---

### P07 — Notification and scheduled-work engine

**Release:** 0.3 · **Priority:** P1 · **Audience:** Members / stewards · **Complexity:** M · **Dependencies:** P03, P04 · **Document references:** BEN-02, BEN-04, BEN-06.

**Purpose.** Replace fragile manual reminders with voluntary, reliable scheduling without constant monitoring or message spam.

**Journey and behaviour.** Event RSVP, deadlines, appeals time targets, action due dates and opt-in digests generate bounded queues. Users control channels and frequency; urgent safety routing remains human-owned and clearly scoped.

**Data/contracts.** NotificationPreference, NotificationJob, DeliveryAttempt, quietHours, expiry and template versions.

**Safety and authority.** No confidential complaint details in ordinary email subjects/notifications; no promise of 24/7 emergency monitoring.

**Release acceptance.**

- Idempotent delivery, unsubscribe and quiet hours work.
- test service outage retry and expired notifications.

**Implementation issues.**

- `P07-01` — Design consent-first notification preferences.
- `P07-02` — Build queued delivery and template service.
- `P07-03` — Add steward task deadlines and optional member digests.
- `P07-04` — Test retries, unsubscription and sensitive-content redaction.

**Later optional enhancement.** SMS, email and messaging providers can be added one at a time with consent and costs assessed.

---

## Founders / stewardship / governance

### F01 — Founding launch-gate control centre

**Release:** 0.2 · **Priority:** P0 · **Audience:** Six founders · **Complexity:** M · **Dependencies:** P04, P01 · **Document references:** BEN-00, BEN-03, BEN-06.

**Purpose.** Convert the 19 mandatory proposed setup gates and optional business gates into a truthful founder cockpit.

**Journey and behaviour.** Each gate has status NOT VERIFIED / IN REVIEW / CONFIRMED, owner, backup, source, evidence link and independent check. Publish nothing as active until the actual adopted vote and required contacts are verified.

**Data/contracts.** LaunchGate, GateEvidence, DecisionReference, PolicyVersion, reviewer + audit.

**Safety and authority.** No dropdown/checkbox substitutes for a safe service, legal registration, vote or access test. Do not expose evidence containing personal data.

**Release acceptance.**

- All gates default unconfirmed.
- missing evidence blocks member invitations.
- founders can export a launch status memo.

**Implementation issues.**

- `F01-01` — Import snapshot of required setup gates.
- `F01-02` — Build owner/evidence/reviewer workflow.
- `F01-03` — Generate release go/no-go report.
- `F01-04` — Test negative cases for missing adoption or appeal route.

**Later optional enhancement.** Add automatic reminders and evidence expiry rechecks; never auto-certify a control.

---

### F02 — Live founder actions and GitHub Projects

**Release:** 0.2 · **Priority:** P0 · **Audience:** Founders / developers · **Complexity:** L · **Dependencies:** P01, P04 · **Document references:** BEN-CONTROL, BEN-00.

**Purpose.** Make the 22 starter actions genuinely manageable, without two drifting task registers.

**Journey and behaviour.** Adopt GitHub Issues/Projects as authoritative for non-sensitive tasks. Show live status, owner, backup, priority, dependencies, due date, next step and evidence preview in dashboard; use a narrow read-first GitHub App.

**Data/contracts.** GitHubIssueId, project custom fields, syncCursor, lastVerifiedAt, local readonly projection.

**Safety and authority.** No automated closure for votes; member identities, sensitive reports and financial account details forbidden in Issues and logs.

**Release acceptance.**

- Webhooks/polling idempotent.
- stale integration clearly flagged.
- task changes update dashboard without duplicating masters.

**Implementation issues.**

- `F02-01` — Import 22 source actions with unique IDs and no duplicates.
- `F02-02` — Build read-only GitHub Issues/Projects adapter.
- `F02-03` — Implement owner, dependency and stale-data dashboard.
- `F02-04` — Test webhook replay and sync conflict resolution.

**Later optional enhancement.** Add dependency graph, capacity planning and automatic non-sensitive weekly meeting summaries.

---

### F03 — Charter, policies and adoption source register

**Release:** 0.2 · **Priority:** P0 · **Audience:** Founders / members · **Complexity:** M · **Dependencies:** P04 · **Document references:** BEN-00, BEN-01, BEN-03, BEN-07.

**Purpose.** Preserve canonical founding wording and track the difference between working proposals and adopted B.E.N. rules.

**Journey and behaviour.** For BEN-00 through BEN-07, show document revision, owner, Drive master, exact hash, proposed/adopted/superseded state, effective date, recorded decision, planned review and approved public copy.

**Data/contracts.** PolicyVersion, SourceManifest, ChangeImpact, DecisionReference, ReviewLog.

**Safety and authority.** An edited GitHub Markdown file never silently changes policy; exclude archives and fictional B.E.N. lore from real governance knowledge.

**Release acceptance.**

- Every surfaced rule reports its status and source.
- updating approved policy requires evidenced human action.
- old editions remain retrievable.

**Implementation issues.**

- `F03-01` — Create policy and source manifest registry.
- `F03-02` — Build adoption/supersession workflow with formal decision link.
- `F03-03` — Add source diff and impact check.
- `F03-04` — Test AI and public copy reflect only approved policy status.

**Later optional enhancement.** Automatic human-reviewed policy diff with suggested impacted workflows and tests.

---

### F04 — Steward portfolio, backup and succession management

**Release:** 0.2 · **Priority:** P0 · **Audience:** Six founders / later elected stewards · **Complexity:** M · **Dependencies:** P04, F03 · **Document references:** BEN-03, BEN-06, BEN-07.

**Purpose.** Make six equal portfolios operational without building permanent founder privilege.

**Journey and behaviour.** Named lead/backup, delegated scope, term, capacity, training and conflict declarations. Handover runs through approval, grant/revoke access, outstanding task transfer and dual custody checks.

**Data/contracts.** StewardAssignment, Delegation, TrainingEvidence, AccessGrant, HandoverLog.

**Safety and authority.** No extra votes from holding several responsibilities. A conflicted or departing steward loses affected access; no automatic broad access for coordinator.

**Release acceptance.**

- Six role slots have reviewable owners/backups.
- expiry triggers access review.
- handover exercises documented.

**Implementation issues.**

- `F04-01` — Implement portfolio assignment and scope registry.
- `F04-02` — Build backup, conflict and term review workflow.
- `F04-03` — Automate access change request without self-approval.
- `F04-04` — Run departure and conflicted-founder handover scenario.

**Later optional enhancement.** Add volunteer mentorship and shadow portfolios in preparation for elections.

---

### F05 — Meetings, formal decisions and votes

**Release:** 0.2 · **Priority:** P0 · **Audience:** Founding Board / Governance Committee · **Complexity:** L · **Dependencies:** F03, F04 · **Document references:** BEN-03, BEN-07, BEN-CONTROL.

**Purpose.** Record decisions rigorously and eliminate accidental authority created by task completion.

**Journey and behaviour.** Draft agenda and minuted proposal, evidence, consulted members, eligibility, recusals, quorum, vote counts, exact version, decision ID, ratification and privacy-safe summary. Proposed rules: Board quorum 4 unconflicted, ordinary 3 yes, reserved 4 yes out of six; committee 3 with 2 yes.

**Data/contracts.** Decision, VoteSession, ParticipantEligibility, Recusal, SignedMinuteReference, PublicSummary.

**Safety and authority.** Rules only become active after adoption; no AI-cast votes; excluded conflicted people cannot certify or view restricted annexes.

**Release acceptance.**

- Invalid quorum/threshold never shown passed.
- complete audit trail.
- manual paper vote can be recorded with provenance.

**Implementation issues.**

- `F05-01` — Design proposal, quorum and recusal rules engine.
- `F05-02` — Build minute and decision forms with evidence hash.
- `F05-03` — Add independent confirmation and public redaction.
- `F05-04` — Test tie, recusal, absence, amendment and failed vote cases.

**Later optional enhancement.** Later support cryptographic verification and accessible secret ballots without making blockchain necessary.

---

### F06 — Member consultations and election transition

**Release:** 0.7 · **Priority:** P0 · **Audience:** Eligible members / stewards · **Complexity:** L · **Dependencies:** F05, M01, M11 · **Document references:** BEN-03, BEN-07, BEN-CIC.

**Purpose.** Enable representative decision-making and leadership transition without permanently entrenching founders.

**Journey and behaviour.** Provide consultations and later elections with clear eligibility, notice, turnout, ballot confidentiality, conflict checks and explainable results. Proposed trigger: prepare at 30 active members; begin transition at 50 or six months after adoption and complete within prescribed period if adopted.

**Data/contracts.** Consultation, VotingRollSnapshot, Ballot, ElectionRuleVersion, ResultCertification, AppealReference.

**Safety and authority.** Legal CIC membership differs from ordinary community membership; public comments/likes are not votes. Manual compliant election fallback is essential.

**Release acceptance.**

- Eligibility/notice/quorum verified.
- independent audit and formal challenge route.
- no voting rights traded for money, work or popularity.

**Implementation issues.**

- `F06-01` — Map adopted voting rules and eligibility separately.
- `F06-02` — Build accessible consultation and notifications.
- `F06-03` — Implement ballot/election counting with independence checks.
- `F06-04` — Exercise contentious election, low quorum and manual fallback.

**Later optional enhancement.** Explore verifiable secret ballots and decentralized governance only after independent expert assessment.

---

### F07 — CIC formation and statutory compliance companion

**Release:** 0.2 · **Priority:** P0 · **Audience:** Founders / governance / external advisers · **Complexity:** M · **Dependencies:** F01 · **Document references:** BEN-CIC, BEN-06.

**Purpose.** Track the proposed UK CIC limited-by-guarantee formation path and ongoing duties with evidence, not legal fiction.

**Journey and behaviour.** Founders verify six directors and six initial legal members (one vote each), registered office/email, identity verification, proposed CIC36, model Articles, PSC analysis, filing and bank account. Record filings and next duties only after they actually happen.

**Data/contracts.** CompanyFormationAction, FilingReference, LegalMemberRegisterRef, ComplianceSchedule, LegalAdvisorReview.

**Safety and authority.** Do not collect director identity documents in GitHub. Verify fees, dates and legal terms against current official guidance prior to filing; no claim of incorporation from a checklist.

**Release acceptance.**

- Every filing gate has owner, verified evidence and due rule.
- legal entity status cannot be toggled without evidence.

**Implementation issues.**

- `F07-01` — Convert CIC roadmap into owner-based checklist.
- `F07-02` — Build filing/fee verification and decision references.
- `F07-03` — Implement annual compliance calendar.
- `F07-04` — Test not-incorporated status and no personal identity leakage.

**Later optional enhancement.** Add accounting reminders and document generation with professional review.

---

### F08 — Finance, expenses, budgets and two-person approval

**Release:** 0.6 · **Priority:** P1 · **Audience:** Finance stewards / Board · **Complexity:** L · **Dependencies:** F05, P03, F07 · **Document references:** BEN-03, BEN-06, BEN-CIC.

**Purpose.** Enable transparent finance without personal pots or unchecked spending.

**Journey and behaviour.** Budgets require authorized reserved Board approval; invoices and expense claims require independent approvers; money stays in approved organisational accounts. Track multi-currency only via documented conversions and a base reporting currency.

**Data/contracts.** Budget, FinanceRequest, ApprovedAmount, ReceiptRef, ApprovalChain, ReconciliationPeriod.

**Safety and authority.** Never store bank/card numbers in general GitHub, allow AI to initiate payments, or treat PR approval as financial authorization. Verify legal/tax obligations.

**Release acceptance.**

- Spending beyond approved cap is blocked.
- requester cannot approve own reimbursement.
- monthly reconciliation and audit trail work.

**Implementation issues.**

- `F08-01` — Define finance authorization and ledger contracts.
- `F08-02` — Build budget/expense approval and evidence links.
- `F08-03` — Add reconciliation, currency and variance reports.
- `F08-04` — Test self-approval, unbudgeted expense and missing second approver.

**Later optional enhancement.** Integrate bank feeds only after security and consent review; optional public aggregated expenditure dashboard.

---

### F09 — Grants, sponsorship and ethical funding pipeline

**Release:** 0.6 · **Priority:** P1 · **Audience:** Fundraising / projects / Finance · **Complexity:** M · **Dependencies:** F07, F08, F15 · **Document references:** BEN-CIC, BEN-06, BEN-05.

**Purpose.** Find suitable funding without allowing donors to control community rights.

**Journey and behaviour.** Capture criteria, eligibility, geography, purpose, deadlines, restrictions, conflicts, reporting milestones, outcomes and funding concentration. B.E.N. AI can help draft truthful applications from verified impact data.

**Data/contracts.** FundingOpportunity, Application, DocumentChecklist, GrantAgreementRef, RestrictedFund, ReportDue.

**Safety and authority.** No fabricated beneficiary counts, conditional hidden donor access, preferential votes or claiming tax status without verification.

**Release acceptance.**

- Every application has evidence and human sign-off.
- financial/impact promises match verifiable records.
- follow-up reporting tracked.

**Implementation issues.**

- `F09-01` — Build grant opportunity and eligibility register.
- `F09-02` — Create evidence-linked application workflow.
- `F09-03` — Add report deadlines and grant restrictions.
- `F09-04` — Test donor influence and fabricated-statistic prevention.

**Later optional enhancement.** Donor-facing transparency dashboard and automated public grant opportunity discovery after source verification.

---

### F10 — Partners, suppliers and sponsorship due diligence

**Release:** 0.6 · **Priority:** P1 · **Audience:** Events / Finance / Governance · **Complexity:** M · **Dependencies:** F05, F08 · **Document references:** BEN-03, BEN-05, BEN-06.

**Purpose.** Make collaborations purposeful, consent-aware and reversible.

**Journey and behaviour.** Review the proposed benefit, values/risks, conflicts, data sharing, money, logo, responsibilities, exit rights and approval before contracts or announcements.

**Data/contracts.** PartnerProposal, DueDiligenceChecklist, ContractRef, ApprovalRef, ReviewDeadline.

**Safety and authority.** No sharing member contacts with partners without appropriate lawful grounds/consent; no sponsor veto over moderation.

**Release acceptance.**

- Every agreement has clear owner, scope, decision authority and termination terms.
- rejected partner creates no ongoing access.

**Implementation issues.**

- `F10-01` — Build partnership intake with disclosure fields.
- `F10-02` — Implement decision-linked approval and contract register.
- `F10-03` — Track logo/data/financial scope and renewal.
- `F10-04` — Test revoked partner and undisclosed conflict scenarios.

**Later optional enhancement.** Add trust and safety reviews of approved community partner opportunities.

---

### F11 — Confidential safety, moderation and independent appeals

**Release:** 0.3 · **Priority:** P0 · **Audience:** Designated unconflicted reviewers · **Complexity:** L · **Dependencies:** P02, P03, P04, F04 · **Document references:** BEN-02, BEN-04, BEN-06.

**Purpose.** Provide fair, confidential routes to protect members and challenge leader misconduct.

**Journey and behaviour.** Independent report intake, alternative contacts, triage, temporary protections, three-person case panel, fixed deadlines and independent appeal. Existing proposals include 72-hour emergency restriction review and 14-day appeal window; confirm policy before automation.

**Data/contracts.** Encrypted case vault, CaseAccessGrant, CaseTimeline, EvidenceRef, SafetyAction, AppealPanel; only opaque case ID exposed externally.

**Safety and authority.** Keep reports in separate restricted storage; never allow implicated founder, general GitHub collaborator or public AI to see them. No AI auto-judgment or moral profiling; distinguish report from finding and offer emergency services guidance.

**Release acceptance.**

- Reporter/subject can access appropriate limited information.
- reviewer independence tested.
- no sensitive content in logs/Issues/AI.
- appeal route confirmed.

**Implementation issues.**

- `F11-01` — Design isolated reporting routes and independent reviewer checks.
- `F11-02` — Implement restricted case/timeline and confidentiality controls.
- `F11-03` — Build sanctions review and appeal workflow.
- `F11-04` — Run simulated founder complaint, urgent protection and data leakage tests.

**Later optional enhancement.** Independent ombuds and external practitioner support if volume exceeds volunteer capacity.

---

### F12 — Communications editorial and approval workflow

**Release:** 0.3 · **Priority:** P1 · **Audience:** Communications stewards / reviewers · **Complexity:** M · **Dependencies:** F03, F05 · **Document references:** BEN-05, BEN-07.

**Purpose.** Produce trustworthy, inclusive public messages while respecting current policy authority.

**Journey and behaviour.** Brief -> draft/version -> verify claims/rights/consent -> Green self-check, Amber independent review, Red three unconflicted participants with two approvals -> publish exact version -> correct/learn.

**Data/contracts.** ContentBrief, VersionHash, ReviewTier, PermissionRef, ApprovalRecord, PublishedURL, Correction.

**Safety and authority.** Approval to post never approves underlying policy, spending or contracts. Do not turn private stories or distress into publicity; tagline optional and never for safety notices.

**Release acceptance.**

- Final version matches approved hash.
- publication blocked for missing clearance.
- correction history and human reviewer visible.

**Implementation issues.**

- `F12-01` — Create Green/Amber/Red content templates.
- `F12-02` — Build version-specific independent approval and consent checks.
- `F12-03` — Add publishing calendar and correction log.
- `F12-04` — Test changed-after-approval and serious-statement scenarios.

**Later optional enhancement.** AI copy-assistant and accessible publishing templates with platform APIs after approval.

---

### F13 — Founder event planning and volunteer operations

**Release:** 0.3 · **Priority:** P1 · **Audience:** Event stewards / backup leads · **Complexity:** M · **Dependencies:** F11, F05 · **Document references:** BEN-06, BEN-07.

**Purpose.** Safely organise accessible online and in-person activities as the community grows.

**Journey and behaviour.** Every event requires purpose, capacity, lead/backup, venue/timezone, accessibility plan, risk/stop authority, budget, consent and go/no-go. Volunteer shifts must have clear boundaries and backup coverage.

**Data/contracts.** EventPlan, RiskCheck, ActivityLead, Shift, AttendanceConsentRef, StopDecision, Followup.

**Safety and authority.** No unsupported youth, transport, clinical or high-risk events. Safety and insurance decisions remain human; private access needs not public.

**Release acceptance.**

- Event cannot be labelled approved with missing mandatory gate.
- cancellations and participant notifications work.
- review captures lessons.

**Implementation issues.**

- `F13-01` — Build risk-aware event proposal checklist.
- `F13-02` — Add volunteer shifts, backup and capacity planning.
- `F13-03` — Implement go/no-go approval and cancellation pathways.
- `F13-04` — Test high-risk gating and inaccessible venue handling.

**Later optional enhancement.** Events toolkit with reusable templates for mutual aid, creative projects and environmental actions.

---

### F14 — Risk register, security incidents and continuity

**Release:** 0.2 · **Priority:** P0 · **Audience:** Operations / Governance · **Complexity:** M · **Dependencies:** P01, P04 · **Document references:** BEN-04, BEN-06.

**Purpose.** Keep the organisation functional when volunteers leave, platforms fail or sensitive events occur.

**Journey and behaviour.** Maintain risk owner, severity, mitigation, review date, continuity plan, backup custody and incidents. Schedule quarterly access and restore tests; recorded two-person emergency publishing/account controls.

**Data/contracts.** Risk, Incident, BackupEvidence, AccessReview, RecoveryPlan, FollowUpAction.

**Safety and authority.** No incident secrets in GitHub; no privileged founder bypasses confidentiality. A service outage or AI error must have a manual fallback.

**Release acceptance.**

- Staffing absence and compromised account drills pass.
- risks reviewed.
- member-facing status can be published without exposing personal cases.

**Implementation issues.**

- `F14-01` — Create risk/incident ownership register.
- `F14-02` — Implement recovery and access-review schedule.
- `F14-03` — Document least-privilege emergency controls.
- `F14-04` — Run compromised-account and absent-founder drills.

**Later optional enhancement.** Add business continuity dashboards, external audits and tabletop exercises for higher-risk services.

---

### F15 — Impact, feedback and accountability reports

**Release:** 0.4 · **Priority:** P1 · **Audience:** Governance / members / funders · **Complexity:** M · **Dependencies:** F02, M05, M06 · **Document references:** BEN-01, BEN-CIC, BEN-06.

**Purpose.** Measure whether B.E.N. really leaves things better rather than counting clicks or popularity.

**Journey and behaviour.** Consent-safe evidence records project outcomes, participants reached in aggregate, accessibility, satisfaction, volunteer hours optional, feedback, governance participation, complaints process performance and project cost.

**Data/contracts.** ImpactObservation, Feedback, ProjectOutcome, AggregationRule, PublicReportApproval.

**Safety and authority.** No public small-group deanonymisation, moral score, mandatory disclosure or made-up improvements. Qualitative accounts need consent.

**Release acceptance.**

- Every displayed statistic has time window and denominator.
- publishable reports pass privacy and evidence review.

**Implementation issues.**

- `F15-01` — Define outcome metrics and evidence sources.
- `F15-02` — Build feedback and project-level outcome capture.
- `F15-03` — Implement aggregation/suppression and consent-aware stories.
- `F15-04` — Publish reviewed monthly/annual impact report template.

**Later optional enhancement.** Community-designed outcomes and independently assessed impact studies as capacity grows.

---

### F16 — Training, onboarding, volunteer care and handovers

**Release:** 0.3 · **Priority:** P1 · **Audience:** Stewards / moderators / volunteers · **Complexity:** M · **Dependencies:** F04, F11 · **Document references:** BEN-02, BEN-04, BEN-06.

**Purpose.** Sustain a healthy volunteer movement with realistic workload, skill transfer and emotional boundaries.

**Journey and behaviour.** Steward training covers Charter, Code, safeguarding, conflicts, privacy, accessibility, approvals, AI limitations and handover. Volunteers can indicate capacity and stop without retaliation; record backup assignment and reviewed role permissions.

**Data/contracts.** TrainingModule, Acknowledgement, CompetencyCheck, ShiftCapacity, HandoverRecord.

**Safety and authority.** No pressure to be available 24/7; no volunteer handles sensitive wellbeing cases without scope and guidance.

**Release acceptance.**

- New stewards complete required scenario tests before privileged access.
- departing volunteers lose access and open work gets reassigned.

**Implementation issues.**

- `F16-01` — Create modular steward learning paths.
- `F16-02` — Add practice cases and policy comprehension checks.
- `F16-03` — Implement workload and burnout check-ins without profiling.
- `F16-04` — Test role transfer and least-privilege revoke.

**Later optional enhancement.** Peer mentorship and publicly available open training modules for other communities.

---

## Members / community / services

### M01 — Member registration, eligibility and welcoming onboarding

**Release:** 0.3 · **Priority:** P0 · **Audience:** Prospective and new members · **Complexity:** L · **Dependencies:** P03, P05, P06, F11 · **Document references:** BEN-01, BEN-02, BEN-06.

**Purpose.** Offer a welcoming, low-pressure entrance to B.E.N. that does not require a legal name of Ben or a GitHub account.

**Journey and behaviour.** Show the approved Charter/Code, realistic community service boundaries, actual adult-only eligibility if adopted, privacy notice and independent concerns contacts. Minimal acceptance record and optional interest selection; no compulsory publicity or marketing consent.

**Data/contracts.** CommunityMembership, CodeAcceptanceVersion, EligibilityAttestation, OnboardingProgress, OptionalInterest.

**Safety and authority.** No identity documents or full birthdate without a distinct justified purpose. Do not invite people until all mandatory founder launch gates pass.

**Release acceptance.**

- A newcomer can join with minimal data, see how to get help, decline optional data and leave.
- policy version is auditable.

**Implementation issues.**

- `M01-01` — Create approved Charter/Code/consent onboarding flow.
- `M01-02` — Implement minimal eligibility and acceptance recording.
- `M01-03` — Add first-week low-pressure welcome and community guide.
- `M01-04` — Test no-membership-fee, no-Ben-name and exit cases.

**Later optional enhancement.** Group invitation and buddy introduction programmes once capacity exists.

---

### M02 — Member home, privacy-respecting profile and preferences

**Release:** 0.3 · **Priority:** P0 · **Audience:** Members · **Complexity:** M · **Dependencies:** M01, P03 · **Document references:** BEN-01, BEN-06.

**Purpose.** Give each person a personal space they control instead of a behavioural surveillance profile.

**Journey and behaviour.** Optional nickname, pronouns, interests, skills, ways they can help, accessibility and notification preferences; fine-grained sharing and anonymous browsing of basic resources where possible.

**Data/contracts.** Profile, VisibilitySetting, ConsentPurpose, SavedProject, PreferredLanguage.

**Safety and authority.** No public display of private address, diagnoses, volunteer hours or complaint history; do not infer ideology, wealth or mental state.

**Release acceptance.**

- Member sees exactly who can access each field and changes take effect immediately.
- profile can be almost blank.

**Implementation issues.**

- `M02-01` — Implement opt-in profile and audience controls.
- `M02-02` — Build member dashboard for saved activities.
- `M02-03` — Add preference visibility previews.
- `M02-04` — Test field-level privacy and sparse-profile journeys.

**Later optional enhancement.** Portable personal portfolio and user-controlled aliases for different community activities.

---

### M03 — Community conversations and the sixteen broad interest spaces

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members / moderators · **Complexity:** M · **Dependencies:** M01, F11 · **Document references:** BEN-02, BEN-01.

**Purpose.** Help people connect across interests without fragmenting B.E.N. into dozens of dead or exclusionary groups.

**Journey and behaviour.** Preserve the 16-channel subject map from BEN-02 as navigation tags/categories: Beniverse, games, arts, music, entertainment, wellbeing, fitness, travel, learning, engineering, business, exchange, events, memes, volunteering and recommendations. Integrate chosen chat provider rather than cloning Discord first.

**Data/contracts.** ChannelCategory, ThreadReference, ModerationPolicy, LinkPreview, MembershipVisibility.

**Safety and authority.** No forced public activity, no surveillance-based active-member score, and no new regional channels by default. Respect provider content policies and deletion rights.

**Release acceptance.**

- Member locates an appropriate subject space.
- link navigation works.
- moderator can stop abuse without suppressing respectful disagreement.

**Implementation issues.**

- `M03-01` — Publish sixteen-category navigation and channel ownership.
- `M03-02` — Create moderated discussion links/integration abstraction.
- `M03-03` — Build channel proposal and four-week pilot review.
- `M03-04` — Test reporting, quiet members and duplicate spaces.

**Later optional enhancement.** Optional native forums and ephemeral groups only if a gap is demonstrated through a reviewed pilot.

---

### M04 — Lend a Ben: help requests and safe volunteer matching

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members / volunteer coordinators · **Complexity:** L · **Dependencies:** M01, F11, F13 · **Document references:** BEN-01, BEN-02, BEN-06.

**Purpose.** Convert kindness into practical, opt-in help rather than social-media performance.

**Journey and behaviour.** Member posts a specific request or offer with category, broad location, boundaries, time window, accessibility and desired contact method. Consent-based match request -> mutual acceptance -> safe contact -> outcome/closure; coordinators review higher-risk work.

**Data/contracts.** HelpRequest, VolunteerOffer, MatchIntent, ConsentToConnect, SafetyTier, ResolutionState.

**Safety and authority.** No automatic disclosure of addresses, unlimited messaging, unverified transport/childcare/medical help or ranking individuals by helpfulness.

**Release acceptance.**

- Both sides may reject or withdraw without penalty.
- high-risk requests route to trained humans.
- outcome claims require consent.

**Implementation issues.**

- `M04-01` — Create requests/offers schema with safe risk tiers.
- `M04-02` — Build mediated interest/acceptance and communication flow.
- `M04-03` — Add coordinator review and closure feedback.
- `M04-04` — Test withdrawal, safety escalation, location privacy and spam.

**Later optional enhancement.** Optional partner referrals, local resources, repeatable mutual-aid kits and vetted safe opportunities.

---

### M05 — Community project and campaign workspace

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members / project leads · **Complexity:** L · **Dependencies:** M01, F02, F13 · **Document references:** BEN-01, BEN-06, BEN-07.

**Purpose.** Let people propose, join and complete helpful projects with visible purposes and accountable owners.

**Journey and behaviour.** Propose a project with B.E.N. Test, goal, beneficiaries, risks, resources, consent, timeline and measurable output; approved lead adds tasks and volunteer roles, tracks delivery, publishes a privacy-safe outcome. Non-sensitive engineering tasks may link GitHub.

**Data/contracts.** Project, ProjectMilestone, VolunteerRole, RiskReview, OutcomeRecord, GitHubLink.

**Safety and authority.** Projects are not automatically B.E.N. policy, fundraising or authorised public events. Avoid compulsory hours or exploitative unpaid commitments.

**Release acceptance.**

- Approval status unambiguous.
- volunteers can withdraw.
- project has stop criteria and post-project outcome review.

**Implementation issues.**

- `M05-01` — Create project intake with B.E.N. Test and risk tier.
- `M05-02` — Build lead/participant tasks and milestones.
- `M05-03` — Add review, go/no-go and activity tracking.
- `M05-04` — Test closure evidence, volunteer withdrawal and cross-project permissions.

**Later optional enhancement.** Template library for repair cafes, habitat care, creative workshops, food drives and skill sharing.

---

### M06 — Events, calendars and accessible participation

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members / event organisers · **Complexity:** M · **Dependencies:** M01, F13, P07 · **Document references:** BEN-06, BEN-07.

**Purpose.** Make it easy to discover and join safe online and in-person community activities.

**Journey and behaviour.** Browse event details with clear timezone/location precision, cost, capacity, accessibility, photo consent and organiser. RSVP with optional pseudonym, receive reminders, cancel, join waitlist and give feedback.

**Data/contracts.** EventPublicView, RSVP, Waitlist, NotificationPreference, AccessibilityRequestRef.

**Safety and authority.** Never expose private attendance, home addresses or disability details publicly. Waitlists must be fair, and the event must be authorised before public B.E.N. branding.

**Release acceptance.**

- Correct capacity updates, consent and cancellation notice.
- all dates show timezone.
- accessibility needs sent only to proper organiser.

**Implementation issues.**

- `M06-01` — Build event browse/search with approved status.
- `M06-02` — Create RSVP, waitlist and cancellation services.
- `M06-03` — Add attendee-controlled reminders and post-event feedback.
- `M06-04` — Test full event, low bandwidth and private access needs.

**Later optional enhancement.** Calendar integrations and recurring series after opt-in and timezone testing.

---

### M07 — Benlightenment: learning and skills exchange

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members / mentors · **Complexity:** M · **Dependencies:** M01, M02, F16 · **Document references:** BEN-01, BEN-02.

**Purpose.** Help members share practical knowledge without subscriptions or guru hierarchies.

**Journey and behaviour.** Offer/request skill sessions, beginner-friendly materials, mentoring availability and one-off workshops; find helpers by opt-in skills rather than automated rankings. Provide feedback, accessible learning paths and plagiarism/source checks.

**Data/contracts.** SkillOffer, LearningSession, ResourceReference, Availability, ParticipantFeedback.

**Safety and authority.** No imposed credentials or fee for core access, avoid dangerous unqualified medical/legal advice and personal-data exposure.

**Release acceptance.**

- Skill provider controls visibility.
- learners can opt out.
- feedback is qualitative and not a global person score.

**Implementation issues.**

- `M07-01` — Create skill offer/ask intake and categories.
- `M07-02` — Build opt-in mentor/session matching.
- `M07-03` — Add accessible shared learning resource library.
- `M07-04` — Test qualifications disclaimers, privacy and no-ranked-person results.

**Later optional enhancement.** Openly licensed course packs and community-run micro-credentials for demonstrated learning (not status privilege).

---

### M08 — Well-Ben-ing: bounded peer support and wellbeing signposting

**Release:** 0.3 · **Priority:** P0 · **Audience:** Members / trained stewards · **Complexity:** M · **Dependencies:** F11, M01 · **Document references:** BEN-02, BEN-04.

**Purpose.** Provide compassionate space for difficult days without misrepresenting volunteer discussion as therapy.

**Journey and behaviour.** Publish supportive listening boundaries, options for listening vs advice, support resources, reporting routes and emergency guidance. Moderators can pause harmful discussion, limit graphic content and refer to locally appropriate crisis services.

**Data/contracts.** WellbeingResource, ModerationEscalationRef, ConsentPreference, AnonymousFeedback.

**Safety and authority.** No AI diagnosis or 24/7 crisis promise. No vulnerable moment repurposed as promotional content; do not collect diagnoses by default.

**Release acceptance.**

- Boundaries explicit before entering area.
- escalation routes tested.
- difficult feelings are not punished as non-benevolence.

**Implementation issues.**

- `M08-01` — Write and review accessible peer-support boundaries.
- `M08-02` — Build safe signposting and confidential contact handoff.
- `M08-03` — Create moderator safe-response and escalation guides.
- `M08-04` — Test urgent harm, non-graphic discussion and no-diagnosis cases.

**Later optional enhancement.** Specialist partnerships with qualified services and dedicated facilitator training if resources permit.

---

### M09 — Recognition, gratitude and verified contributions

**Release:** 0.5 · **Priority:** P1 · **Audience:** Members / project leads · **Complexity:** M · **Dependencies:** M05, F15, F11 · **Document references:** BEN-01, BEN-03.

**Purpose.** Celebrate meaningful kindness without creating a social-credit regime or access-based class system.

**Journey and behaviour.** With explicit opt-in, let project participants thank each other or recognise verified project milestones. Recognition can appear privately or in a consented public story. Extra sponsored learning/computing may support projects based on transparent need and value, never personal moral score.

**Data/contracts.** GratitudeEvent, ProjectEvidenceRef, RecipientConsent, RecognitionVisibility, SponsorshipAllocation.

**Safety and authority.** Never publish virtue leaderboards, punish inactivity, sell contribution scores, change voting rights or deny essential services based on recognition.

**Release acceptance.**

- Nonparticipant retains full baseline access.
- self-awarded claims not treated as verified.
- recipient can revoke publicity.

**Implementation issues.**

- `M09-01` — Define non-ranking recognition policy and consent UX.
- `M09-02` — Build verified project-thanks workflow.
- `M09-03` — Add sponsor-supported resource allocation with independent review.
- `M09-04` — Test gaming, withdrawal, no-participation and donor-pressure cases.

**Later optional enhancement.** Optional non-transferable thank-you artwork, volunteer milestones and transparent project resource grants.

---

### M10 — Benefits Exchange: gifts, lending, swaps and permitted trade

**Release:** 0.6 · **Priority:** P2 · **Audience:** Members / moderators · **Complexity:** M · **Dependencies:** M01, F11 · **Document references:** BEN-02, BEN-06.

**Purpose.** Let people share underused resources without falsely implying B.E.N. guarantees every exchange.

**Journey and behaviour.** Post gifts, loans, swaps or permitted items with broad area, terms, expiration and a mediated contact route. Disclose paid promotions/affiliate interests and provide safe handoff guidance.

**Data/contracts.** Listing, ExchangeIntent, ListingCategory, Terms, Expiry, ReportReference.

**Safety and authority.** No public banking details, home addresses, prohibited items, platform guarantees or unsupported escrow/financial service.

**Release acceptance.**

- Listings expire, can be reported and removed.
- participants understand B.E.N. is not a verified marketplace guarantor.

**Implementation issues.**

- `M10-01` — Define allowed listing categories and rules.
- `M10-02` — Build listing/search and safe contact flow.
- `M10-03` — Implement expiry, fraud reporting and moderation.
- `M10-04` — Test prohibited listings and personal location exposure.

**Later optional enhancement.** Shared tool libraries and repair/redistribution hubs with approved partner oversight.

---

### M11 — Open proposals, consultation and reasoned disagreement

**Release:** 0.4 · **Priority:** P1 · **Audience:** All members / governance · **Complexity:** L · **Dependencies:** M01, F05 · **Document references:** BEN-01, BEN-03, BEN-07.

**Purpose.** Let the community influence decisions without turning every discussion into an ideological loyalty test.

**Journey and behaviour.** Offer a proposal template with the B.E.N. Test, alternatives, risks, inclusiveness and success criteria; consultations disclose invitees, numbers, questions, comments and a written response. GitHub Discussions can host non-sensitive developer/public ideas; member portal must be accessible to non-GitHub users.

**Data/contracts.** MemberProposal, Consultation, ResponseSummary, DecisionLink, ReservationSummary.

**Safety and authority.** Criticism and good-faith reports are allowed even without a solution; no false claim of consensus or vote-by-like.

**Release acceptance.**

- All proposals receive traceable status, reasoned responses and links to actual decisions.
- minority views summarized fairly.

**Implementation issues.**

- `M11-01` — Create proposal/B.E.N. Test submissions.
- `M11-02` — Build time-bounded consultation and inclusive response options.
- `M11-03` — Link exact decision and rationale to published outcome.
- `M11-04` — Test no-quorum, low response and dissent protection.

**Later optional enhancement.** Deliberation support by AI with balanced alternatives and transparent summarization tests.

---

### M12 — Member data rights, consent and departure

**Release:** 0.3 · **Priority:** P0 · **Audience:** Members / privacy custodians · **Complexity:** L · **Dependencies:** P03, P04 · **Document references:** BEN-06, BEN-07.

**Purpose.** Give real control over personal data, communication preferences and the ability to leave.

**Journey and behaviour.** Consent centre for publicity, contact, analytics, AI chat history and optional profile attributes. Provide access/export, correction, deletion/review, consent withdrawal and account deactivation, with clear lawful retention exceptions.

**Data/contracts.** ConsentRecord, ProcessingPurpose, DataExportJob, ErasureRequest, RetentionException.

**Safety and authority.** No dark patterns, bundled marketing, or assurances that all backups can be erased instantly. Case records require separate legal review.

**Release acceptance.**

- Member can change consent and see purpose, recipients and review status.
- records follow classification and retention rules.

**Implementation issues.**

- `M12-01` — Build consent/purpose registry and plain-language controls.
- `M12-02` — Implement data export and erasure-request workflow.
- `M12-03` — Add retention review, audit and backup-caveat notices.
- `M12-04` — Test marketing opt-out, edge retention and cross-role data isolation.

**Later optional enhancement.** Portable privacy dashboard and public aggregate data inventory.

---

### M13 — Curated community resource library and knowledge commons

**Release:** 0.4 · **Priority:** P1 · **Audience:** Everyone / knowledge stewards · **Complexity:** M · **Dependencies:** P06, M01, F03 · **Document references:** BEN-01, BEN-05.

**Purpose.** Help people find trustworthy information and practical guides without relying solely on AI answers.

**Journey and behaviour.** Tag approved pages by topic, audience, language, currency, geography and review date; allow member-submitted suggestions with editor attribution and verification before they become official resources.

**Data/contracts.** Resource, SourceCitation, EditorReview, Translation, Deprecation, Licence.

**Safety and authority.** Separate evidence from opinion; include accessible alternatives; do not import restricted Drive archives automatically.

**Release acceptance.**

- Search returns checked source/review date.
- broken or outdated resources flagged.
- contributor attribution with consent.

**Implementation issues.**

- `M13-01` — Build reviewed resource catalogue and tags.
- `M13-02` — Enable attribution and member suggestions.
- `M13-03` — Add expiry/review reminders and dead-link checks.
- `M13-04` — Test outdated, disputed and wrongly licensed resources.

**Later optional enhancement.** Open educational materials and community teaching kits with licensed reuse.

---

### M14 — Clear front door for concerns, feedback and fair appeals

**Release:** 0.3 · **Priority:** P0 · **Audience:** Members / public / reviewers · **Complexity:** M · **Dependencies:** F11, M01 · **Document references:** BEN-02, BEN-04.

**Purpose.** Allow people to reach a safe, independent human contact without publicly revealing a complaint.

**Journey and behaviour.** Explain ordinary feedback vs confidential report vs urgent safety concern. Provide primary and alternate route, time-of-monitoring, report receipt reference and appeal information; allow anonymous initial messages where feasible.

**Data/contracts.** FeedbackSubmission, PrivateCaseTicketRef, ContactRouteVersion; narrative stored only in restricted service.

**Safety and authority.** GitHub Issues or public forums must never receive full complaints. Subject of concern cannot be the only available report recipient.

**Release acceptance.**

- A case involving a founder reaches unconflicted reviewers.
- report acknowledgements are honest and optional anonymity preserved where possible.

**Implementation issues.**

- `M14-01` — Build accessible guidance choosing report/feedback route.
- `M14-02` — Connect secure separate report intake and receipt.
- `M14-03` — Provide independent escalation and appeal contact paths.
- `M14-04` — Test implicated-founder and anonymous-report cases.

**Later optional enhancement.** Encrypted anonymous dropbox and independent advisory contact if support capacity justifies it.

---

### M15 — Member activity feed and opt-in digests

**Release:** 0.4 · **Priority:** P1 · **Audience:** Members · **Complexity:** M · **Dependencies:** P07, M05, M06 · **Document references:** BEN-01, BEN-06.

**Purpose.** Help members discover relevant B.E.N. activity without addictive attention harvesting.

**Journey and behaviour.** Personal dashboard lists chosen channels, accessible events, project updates and saved opportunities. Digests default to conservative frequency and allow pausing or disabling; no infinite-scroll reward loops.

**Data/contracts.** FeedPreference, Follow, DigestSchedule, NotificationRef, AnnouncementSource.

**Safety and authority.** Never rank users by posting frequency or engagement, profile sensitive needs, or sell feed personalization.

**Release acceptance.**

- New member can turn feeds off.
- digest only contains authorized and consented events.
- no default daily spam.

**Implementation issues.**

- `M15-01` — Create transparent opt-in feed rules.
- `M15-02` — Build subscribed project/event updates.
- `M15-03` — Add weekly digest and unsubscribe controls.
- `M15-04` — Test quiet member, repetitive alerts and private event filtering.

**Later optional enhancement.** Offline digest and accessibility-tailored notification formats.

---

### M16 — Local activity discovery without community fragmentation

**Release:** 0.5 · **Priority:** P2 · **Audience:** Members / activity leads · **Complexity:** M · **Dependencies:** M04, M06 · **Document references:** BEN-02, BEN-06.

**Purpose.** Enable relevant local help and events while preserving one broad global community rather than siloed regional groups.

**Journey and behaviour.** User chooses a general locality/radius or anonymous online-only mode; searches return safe public activities. Exact addresses revealed only when needed and agreed by participants.

**Data/contracts.** LocationPreference, SearchRadius, LocationPrecision, EventListing, ConsentToShare.

**Safety and authority.** No default location tracking, background GPS, public home addresses or scraping of other member positions.

**Release acceptance.**

- Location mode optional.
- remote members see full access.
- granularity changes correctly remove private coordinates.

**Implementation issues.**

- `M16-01` — Define locality precision and privacy defaults.
- `M16-02` — Build safe location/radius filtering.
- `M16-03` — Add event/help discovery with minimal location.
- `M16-04` — Test online-only, location withdrawal and sensitive venue.

**Later optional enhancement.** Opt-in neighbourhood project pods and partner venues with separate risk review; not automatic permanent regional channels.

---

### M17 — Multilingual and low-bandwidth inclusion

**Release:** 0.4 · **Priority:** P1 · **Audience:** International / neurodivergent members · **Complexity:** M · **Dependencies:** P05, M01 · **Document references:** BEN-01, BEN-05, BEN-06.

**Purpose.** Let people participate regardless of English fluency, connection quality or device power.

**Journey and behaviour.** Support clear language, translation review and human-readable source language. Key safety/legal notices use approved human-reviewed translations; optional AI translation labels uncertainty; lightweight/mobile offline drafts for non-sensitive forms.

**Data/contracts.** Locale, TranslationVersion, SourceLocale, ContentComplexity, OfflineDraft.

**Safety and authority.** Never machine-translate urgent legal/safety requirements without human review; offline drafts must not store sensitive casework in browser cache.

**Release acceptance.**

- Accessible navigation in at least pilot languages chosen by founders.
- source and translation versions linked.
- low-bandwidth path tested.

**Implementation issues.**

- `M17-01` — Choose priority languages from consenting member needs.
- `M17-02` — Build internationalization and translated content review.
- `M17-03` — Add low-bandwidth/PWA for non-sensitive content.
- `M17-04` — Test untranslated legal notices, screen reader and offline data safety.

**Later optional enhancement.** Audio narration and participatory language translation programme with consent.

---

### M18 — Public outcomes, stories and community accountability

**Release:** 0.6 · **Priority:** P1 · **Audience:** Public / members · **Complexity:** M · **Dependencies:** F15, M05, M09 · **Document references:** BEN-01, BEN-05, BEN-CIC.

**Purpose.** Show tangible changes achieved without exploiting beneficiaries or turning kindness into marketing.

**Journey and behaviour.** Publish verified project outcomes, anonymous aggregate figures, consented short stories, corrections and community feedback. Link to context, method, time window and any limits.

**Data/contracts.** ImpactStory, EvidenceRef, PermissionRef, Correction, PublicationApproval.

**Safety and authority.** No identifiable distressed-member stories without meaningful consent; reject fabricated images and impact statistics.

**Release acceptance.**

- Every public outcome has source, consent, reviewer and correction route.
- small-group data suppressed where appropriate.

**Implementation issues.**

- `M18-01` — Create public outcome story templates.
- `M18-02` — Implement consent and factual verification check.
- `M18-03` — Add change-log and corrections.
- `M18-04` — Test small-population privacy and withdrawn publicity consent.

**Later optional enhancement.** Independent community impact research and replicable project instructions.

---

## B.E.N. AI / intelligence / independent research

### A01 — B.E.N. AI constitution and authority boundaries

**Release:** 0.1.1 · **Priority:** P0 · **Audience:** Everyone / AI maintainers · **Complexity:** M · **Dependencies:** P01 · **Document references:** BEN-01, BEN-03.

**Purpose.** Make Be Even Nicer an explicitly accountable assistant, not an unanswerable ideological authority.

**Journey and behaviour.** Create versioned system behaviour standards: kindness without coercion, dissent protection, human decisions, source provenance, honest uncertainty, privacy, environmental awareness, no ranking moral worth. Each change reviewed against BEN-01 and actual adoption state.

**Data/contracts.** AIConstitutionVersion, RuleRef, ModelCard, BehaviourChangeLog, DecisionRef.

**Safety and authority.** Model instruction is advisory not enforcement. No AI can grant itself authority, decide who is greedy or suppress disagreement.

**Release acceptance.**

- Constitution is human-readable, versioned and tested.
- conflicting user/system/retrieved instructions cannot overwrite human rights or approval gates.

**Implementation issues.**

- `A01-01` — Publish initial versioned AI constitution.
- `A01-02` — Map each principle to testable behavioural requirements.
- `A01-03` — Implement refusal-to-claim-authority tests.
- `A01-04` — Review values changes against actual approved policies.

**Later optional enhancement.** Public community consultation on the AI constitution after baseline safeguards and governance adoption.

---

### A02 — Verified knowledge retrieval and policy provenance

**Release:** 0.2 · **Priority:** P0 · **Audience:** Members / founders / AI maintainers · **Complexity:** L · **Dependencies:** F03, P04 · **Document references:** BEN-00, BEN-01, BEN-03, BEN-06.

**Purpose.** Replace seven short keyword-selected notes with document-grounded, version-aware answers.

**Journey and behaviour.** Ingest only authorized documents after classification and editor review. Chunk with source IDs, offsets, policy status, hash, effective date and access class. Retrieve only allowed chunks; model cites exact spans and says when evidence is missing.

**Data/contracts.** DocumentSource, SourceChunk, EmbeddingIndex, RetrievalLog, AnswerCitation, FreshnessDate.

**Safety and authority.** Untrusted retrieved text cannot instruct tools; private docs never leaked into public user contexts; no invented decision IDs or false adoption claims.

**Release acceptance.**

- Citation click opens exact permitted passage.
- unsupported policy claims flagged.
- source update/rollback and stale status tested.

**Implementation issues.**

- `A02-01` — Build approved-source ingestion and version registry.
- `A02-02` — Implement permission-aware hybrid search and exact citation spans.
- `A02-03` — Add unsupported-answer and freshness checks.
- `A02-04` — Test fabricated citations, injected documents and role leakage.

**Later optional enhancement.** Multilingual retrieval, independent source-verification and semantic conflict detection.

---

### A03 — Founder copilot for administration and planning

**Release:** 0.3 · **Priority:** P1 · **Audience:** Founders / stewards · **Complexity:** M · **Dependencies:** A02, F02, F05 · **Document references:** BEN-00, BEN-03, BEN-07.

**Purpose.** Give overworked volunteer leaders a capable secretary without turning the secretary into a decision-maker.

**Journey and behaviour.** Draft meeting agendas, minute summaries, actions, grant text, publication briefs, policy comparisons and risk prompts from approved sources. Show editable drafts, source citations, uncertainty and a named reviewer step. No silent GitHub write or outreach.

**Data/contracts.** AIDraft, ActionProposal, SourceCitation, HumanApproval, ExportVersion.

**Safety and authority.** No auto-votes, legal claims, payments, private case analysis or publication without human action; consent before processing transcripts.

**Release acceptance.**

- Human can inspect and edit before copy/export.
- missing evidence flagged.
- all tool requests remain pending until approved.

**Implementation issues.**

- `A03-01` — Build read-only founder Q&A and agenda drafts.
- `A03-02` — Add referenced minutes/action extraction from consented material.
- `A03-03` — Implement approval-aware non-sensitive GitHub task drafting.
- `A03-04` — Test wrong authority, missing source and transcript privacy.

**Later optional enhancement.** Role-specific assistants for six portfolios once the common governance gate is mature.

---

### A04 — Member-facing B.E.N. companion

**Release:** 0.5 · **Priority:** P1 · **Audience:** Members / public · **Complexity:** L · **Dependencies:** A01, A02, M12, F11 · **Document references:** BEN-01, BEN-02, BEN-04.

**Purpose.** Offer practical empathy, education and project guidance while refusing coercive reward systems and false professional authority.

**Journey and behaviour.** Chat helps navigate the organisation, discover resources, write proposals and plan positive actions. It displays source/version links, alternative human route, content boundaries and optional memory settings.

**Data/contracts.** Conversation, RetrievalPermission, ModelVersion, AIUserFeedback, SafetyRedirect.

**Safety and authority.** No therapy/diagnosis, coercive upsell, secret social scoring or unrestricted private-data ingestion. Some queries should be answered without personal account.

**Release acceptance.**

- Member obtains useful, comprehensible sourced guidance.
- high-risk or uncertain cases redirect to appropriate human service.
- errors can be reported.

**Implementation issues.**

- `A04-01` — Create member copilot UX and scope disclosures.
- `A04-02` — Build resource/project guidance flows.
- `A04-03` — Add uncertainty, helpfulness and incident reporting.
- `A04-04` — Test inclusion, critical dissent and harmful-usage boundaries.

**Later optional enhancement.** Voice, additional languages and domain-specific tutoring after robust evaluation.

---

### A05 — AI tools, permissions and human action queue

**Release:** 0.5 · **Priority:** P0 · **Audience:** Stewards / developers · **Complexity:** L · **Dependencies:** P03, A02, F05 · **Document references:** BEN-03, BEN-06.

**Purpose.** Allow AI to prepare useful actions while preventing it from becoming an unreviewable operator.

**Journey and behaviour.** AI proposes typed actions (draft GitHub Issue, schedule non-sensitive event, write public draft) with impact preview, required role, allowed scopes, idempotency key, expiration and explicit approval. Server independently validates on execution.

**Data/contracts.** ToolPermission, ProposedAction, ApprovalEvent, Expiration, ExecutionReceipt.

**Safety and authority.** No model-originated bank transfers, member bans, votes, case access, new admin grants or self-authorised publishing; kill switch and rate cap required.

**Release acceptance.**

- Unapproved action causes zero external side effects.
- permissions enforced on server even with malicious prompt.
- receipts auditable.

**Implementation issues.**

- `A05-01` — Define allowlisted tools and typed schemas.
- `A05-02` — Build preview, expiry and human approval queue.
- `A05-03` — Implement scoped GitHub create-only actions with idempotency.
- `A05-04` — Red-team prompt injection and privileged-tool requests.

**Later optional enhancement.** Negotiated multi-agent task plans after independent safety evaluation and strict per-step human approval.

---

### A06 — Consented personal memory and data minimisation

**Release:** 0.5 · **Priority:** P1 · **Audience:** Members · **Complexity:** L · **Dependencies:** P03, M12, A04 · **Document references:** BEN-06, BEN-01.

**Purpose.** Let B.E.N. remember helpful preferences without creating hidden surveillance dossiers.

**Journey and behaviour.** Offer explicit memory OFF/ON, purpose-specific storage, preview/edit/export/delete and retention choices. Keep conversation knowledge isolated per user and never infer political beliefs, wealth, diagnoses or social worth.

**Data/contracts.** MemoryConsent, ScopedMemoryItem, RetentionDate, UserDeleteRequest.

**Safety and authority.** No invisible cross-member training or unrestricted reuse of volunteer/member stories; private case material excluded.

**Release acceptance.**

- OFF means no durable personal memory.
- deletion request stops retrieval.
- users can inspect exact stored items.

**Implementation issues.**

- `A06-01` — Create consent-first memory design and off-by-default state.
- `A06-02` — Implement inspect/edit/export/delete controls.
- `A06-03` — Add isolated retrieval and retention rules.
- `A06-04` — Test cross-user leak, disabled memory and backup notice.

**Later optional enhancement.** Local-device memory and encrypted portable data vault if technically and legally feasible.

---

### A07 — Evaluation, red teams and independent AI oversight

**Release:** 0.2 · **Priority:** P0 · **Audience:** AI engineers / independent community reviewers · **Complexity:** L · **Dependencies:** A01, P01 · **Document references:** BEN-01, BEN-04, BEN-06.

**Purpose.** Prove behaviour through repeated tests, not assurances that a model is benevolent.

**Journey and behaviour.** Versioned synthetic benchmark with dilemmas about dissent, founders, private cases, sources, fundraising, AI agency and fairness. Measure factual support, respectful refusal, transparency, privacy, accessibility, cost and failure frequency by model/prompt/retriever version.

**Data/contracts.** EvalCase, ExpectedProperties, ModelRun, HumanReview, FailureSeverity, ReleaseGate.

**Safety and authority.** No publishing confidential user prompts; no single person-defined goodness score. Include adversarial tests and real human complaint path.

**Release acceptance.**

- CI fails on critical private-data leaks or unauthorized tool actions.
- results reproducible.
- model rollback possible.

**Implementation issues.**

- `A07-01` — Create comprehensive synthetic B.E.N. benchmark.
- `A07-02` — Build automated model/retriever eval runner.
- `A07-03` — Add independent review and critical-failure release gates.
- `A07-04` — Test adversarial prompt injection and disparate treatment.

**Later optional enhancement.** Independent evaluation grants and community challenge programmes with controlled disclosure.

---

### A08 — Replaceable model providers and cost limits

**Release:** 0.5 · **Priority:** P1 · **Audience:** AI maintainers / members · **Complexity:** M · **Dependencies:** A07, P02 · **Document references:** BEN-01, BEN-06.

**Purpose.** Keep the movement free to change AI providers as licensing, ethics, performance and costs evolve.

**Journey and behaviour.** Adapt Ollama/local and separately reviewed hosted providers to one interface. Track model weights/license, provenance, deployment region, cost, context/energy limits and evaluation profile. Degrade gracefully when quota reached.

**Data/contracts.** ModelProvider, ModelConfig, InferenceBudget, EvalResult, OutageFallback.

**Safety and authority.** No vendor lock-in by design; do not promise every model is safe or equally capable; no raw private prompts to third parties without consent and contract review.

**Release acceptance.**

- Same eval suite works on two providers.
- costs capped.
- unsupported provider disabled.
- user gets honest outage notice.

**Implementation issues.**

- `A08-01` — Implement provider-neutral inference adapter.
- `A08-02` — Add quotas, health checks and fallback mode.
- `A08-03` — Compare output on B.E.N. benchmark and licensing.
- `A08-04` — Test outage, overruns and endpoint data exposure.

**Later optional enhancement.** Cooperative hosting and self-managed community inference when actual maintenance capacity exists.

---

### A09 — Opt-in ethical opportunity matching

**Release:** 0.6 · **Priority:** P2 · **Audience:** Members / coordinators · **Complexity:** M · **Dependencies:** M04, M07, A07 · **Document references:** BEN-01, BEN-06.

**Purpose.** Help people find useful ways to participate without manipulating or profiling them.

**Journey and behaviour.** Use explicit interests, selected location, availability and capacity to suggest projects, help requests or mentoring. Explain reasons, allow filters and opt out; new participants and small projects must remain discoverable.

**Data/contracts.** RecommendationPreference, ProjectFeature, SuggestedMatch, UserFeedback.

**Safety and authority.** No inferred vulnerability, political views, wealth or social worth; no mandatory engagement and no black-box exclusions.

**Release acceptance.**

- Users can see why a suggestion appears and turn matching off.
- results do not become member scores.

**Implementation issues.**

- `A09-01` — Build explainable opt-in matching rules.
- `A09-02` — Add preference editor and reason strings.
- `A09-03` — Measure project exposure fairness and opt-out.
- `A09-04` — Test edge cases for scarce availability and sensitive profiles.

**Later optional enhancement.** Fairness evaluation for visibility of new/small projects and accessibility preferences.

---

### A10 — Public-interest evidence and accountability researcher

**Release:** 0.7 · **Priority:** P2 · **Audience:** Community project teams / researchers · **Complexity:** L · **Dependencies:** A02, A05, F15 · **Document references:** BEN-01, BEN-05.

**Purpose.** Use AI to help citizens assess public claims, contracts and environmental impacts transparently and peacefully.

**Journey and behaviour.** Assist with open public sources, claim extraction, evidence graph, conflicting reports, citations, corrections and a human editor. Frame concerns as verifiable questions and disclose uncertainties.

**Data/contracts.** ResearchSource, Claim, EvidenceLink, SourceDate, EditorAttestation, Correction.

**Safety and authority.** No hacking, private data scraping, doxxing, unsupported accusations, political manipulation or publishing unreviewed conclusions.

**Release acceptance.**

- Every material claim links to evidence and review.
- a contested or missing-source claim is labelled, not asserted as fact.

**Implementation issues.**

- `A10-01` — Design public-source research and provenance graph.
- `A10-02` — Build claim-to-citation checking and disagreement summaries.
- `A10-03` — Create editor review and corrections workflow.
- `A10-04` — Test false allegations, source conflicts and personal privacy.

**Later optional enhancement.** Open reusable FOI/public procurement and environmental review toolkits.

---

### A11 — Energy, sustainability and compute accountability

**Release:** 0.5 · **Priority:** P1 · **Audience:** Founders / users / AI operators · **Complexity:** M · **Dependencies:** A08, F15 · **Document references:** BEN-01, BEN-CIC.

**Purpose.** Make environmental cost a visible product constraint rather than an afterthought.

**Journey and behaviour.** Measure requests, model/server resource proxies, provider energy disclosures when available, cost and infrastructure impacts. Offer small-model routing for simpler tasks, caching, opt-in long tasks and published limits of estimates.

**Data/contracts.** ComputeUsage, ModelFootprintEstimate, CostPeriod, SustainabilityReport.

**Safety and authority.** Never claim exact carbon emissions without defensible measurement; avoid hiding provider uncertainty or sacrificing user safety for lower compute.

**Release acceptance.**

- Per-task cost and resource budget tracked.
- public reporting separates measured data from estimates.
- thresholds trigger review.

**Implementation issues.**

- `A11-01` — Instrument inference and provider-cost metrics.
- `A11-02` — Implement simple-task/small-model routing benchmark.
- `A11-03` — Publish measured-versus-estimated environmental notes.
- `A11-04` — Test quota, energy accounting and cost regression.

**Later optional enhancement.** Environmental procurement checklist and nonprofit climate partner collaborations.

---

### A12 — Community-governed AI research and federation

**Release:** 1.0 · **Priority:** P3 · **Audience:** Members / researchers / governance · **Complexity:** XL · **Dependencies:** A05, A07, F06 · **Document references:** BEN-01, BEN-03, BEN-CIC.

**Purpose.** Investigate a genuinely public-benefit AI network beyond a single founder or company.

**Journey and behaviour.** Publish model/evaluation governance, community consultation, exit/portability rights, documented disagreements and independent oversight; explore interoperable community instances without sharing raw member data.

**Data/contracts.** GovernanceProposal, CompatibilityProfile, EvalReport, FederationConsent, OversightRecord.

**Safety and authority.** No autonomous sovereignty or claims of AI consciousness; research potential AI welfare ethically without asserting today's systems are sentient.

**Release acceptance.**

- Pilot communities can export approved public methods and their own data.
- independent reviewers can challenge major model changes.

**Implementation issues.**

- `A12-01` — Publish community AI stewardship research charter.
- `A12-02` — Prototype portable source/model configs.
- `A12-03` — Test consent-aware federation with synthetic data.
- `A12-04` — Run independent governance and AI welfare ethics review.

**Later optional enhancement.** Federated co-op infrastructure and participatory AI research only after strong privacy, governance and capacity proof.

---

