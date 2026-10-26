# B.E.N. OS v0.3 — what actually works

**Developer implementation snapshot · 26 October 2026. No public service is deployed.**

| Feature | Current condition | Release gate / missing work |
|---|---|---|
| GitHub App web sign-in | Implemented and testable with mocked GitHub provider | Real App registration and human identity allowlist required |
| Member vs founder permissions | Server-side role checks, founder/steward allowlists using stable GitHub IDs | Independent account security review, steward assignment decisions, privileged MFA strategy |
| Member onboarding | Pending by default; adult attestation + adopted Code required | Actual founder adoption and safeguarding/age handling review |
| Public UI / design | Responsive single-page interface, no frontend framework | Manual accessibility, mobile and browser QA; content editorial review |
| Local storage | SQLite tables with explicit schema and prepared statements | Managed Postgres, protected backups, migration and monitoring before production |
| Creative curricula | 48 named disciplines, original exercises, four-stage learning paths, private creative journals, 48 draft workpackets, techniques, constructive feedback prompts | Qualified expert review and deeper technique content for each discipline |
| Creative AI mentor | Ollama user chat with discipline instructions and five mentoring modes | Real model evaluation, safeguards, licensing and privacy testing |
| Inspiration gallery | The Met API query for item-verified public-domain image records | External API reliability, image license display, moderation and image accessibility review |
| Opt-in creative directory | Profile editing, collaborator/mentor visibility, private connection requests and recipient approval | Notifications, abuse reporting, independent sanctions/appeals and human mentor quality verification; personal contact blocking is implemented |
| Community projects | Submit, human review, approved listing, join record | Project completion, impact evidence, risk check, notifications |
| Lend a Ben | Submit offer/request, human review, public listing | Consentful matching, time limits, sensitive content review, abuse protections |
| Gatherings | Submit proposed event, human review and join | Capacity, safety, accessibility, insurance and cancellation enforcement |
| Community proposals | Submit, review, optional GitHub issue publishing by separate steward | Consultation/voting system and legal adoption are not automated |
| Founders' tasks | 22 immutable source tasks with saved progress notes; GitHub issue read | Adoption/minutes, role assignment, schedules, full dashboard sync |
| GitHub server integration | Read issues; publish reviewed non-sensitive proposals with separate steward confirmation and duplicate-safe pending/uncertain publication ledger | Register/install app, production audit, webhook and idempotency |
| Member privacy tools | Export prototype data and private journal, delete individual practice notes, block contacts and deactivate from discovery | Full erasure requests, legal holds, backups and retention policy |
| Private gratitude | Send low-volume private thank-you messages, no scores or rankings | Block/report functions, consent and abuse prevention audit |
| Safety / casework | Not implemented deliberately | Separate independently supervised service needed before public pilot |
| Financial, elections, legal records | Not implemented | Legal/formal governance workflows require human decisions, advice and dedicated services |
| Open-source license | Proposed (AGPL preferred), **not yet approved** | Founder rights/legal review and official full license text required |
| CI tests | Automated unit/integration tests, 53-module status/dependency tests and 57 draft creative scenario tests (human scoring pending) | Independent security, load, accessibility and resilience testing |

### Not done and not implied by the UI

- No founder vote has occurred merely because the app displays policy versions or marks a task completed.
- No independent appeal reviewers, safety contacts, crisis service or financial controls are configured by installing this code.
- No public GitHub repository was created or modified by this package.
- No live GitHub identity or payment secrets are bundled.
- The AI was NOT trained from scratch, and no 48-discipline expert claim is warranted.
- Member posts are submitted for review; they are not auto-approved, legal contracts or guarantees that an event is safe.
- There is no social credit, automated human worth scoring or loss of essential access for disagreement.

### Next milestones

1. Founder vote/legal/identity setup, secure staging and database migration.
2. Independent reporting, moderation/appeals and consent compliance.
3. Steward appointment/succession, formal decision register and adoption controls.
4. Member notifications, calendar, connection safety/block tools and events go/no-go safeguards.
5. Expert-reviewed creative learning content, workshops, mentor scheduling and verified sources by discipline.
6. Consultations, participatory governance, public impact reports, grants and sustainability.
7. Ethical AGPL source release after rights ratification and public third-party evaluations.
