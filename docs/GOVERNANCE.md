# Governance bridge: B.E.N. policy vs GitHub permissions

**All numbers below are proposals from BEN-03 v0.2 and the Control Centre; they are NOT a completed adoption vote.** GitHub admins and maintainers implement technical permissions only; they cannot bypass the organisation's adopted decisions.

| B.E.N. proposed body | Scope | Proposed rule |
|---|---|---|
| Six-person Steward Board (founding Council) | Direction, reserved decisions, roles | 6 seats; quorum 4 unconflicted; ordinary minimum 3 yes; reserved minimum 4 yes out of six |
| Three-person Governance Committee | Delegated disputes/content and ordinary formal moderation | 3 unconflicted participants; 2 yes for covered decisions |
| Independent appeals | Human review, no self-judging | 3 independent reviewers, 2 agree on outcome |
| Community participation | Consultations, later elections | Prepare at 30 active members; transition at 50 or 6 months after adoption, whichever first (subject to adopted rules) |

**Proposed public publishing gate:** Green (within approved remit, self-check), Amber (different unconflicted reviewer), Red (three governance reviewers with at least two approvals). Approval to publish an announcement does not approve the underlying budget, contract, policy or event.

**For B.E.N. source records:** IDs should be stable. `ACT-` for actions, `DEC-` for decisions, `CONT-` for content, `APP-` and private `CASE-` for restricted appeals and incidents. Use IDs to cross-reference, not copying evidence into public tasks.

## What GitHub handles

- Pull requests and code review, release tags, CI test results.
- Non-sensitive action tasks, project statuses, community proposals and open technical discussion.
- Public summaries of *approved* decisions, if authorised and privacy-safe.

## What GitHub does not automatically handle

- Formal Board voting eligibility, quorum, recusal, member roll, consent or governance independence.
- Safeguarding reports, identities, case documents and confidential appeals.
- Authorised transfer of money or contract signing.
- Proof that a person has consented to publicity or that an organisation is legally registered.

## Procedure for a significant change

1. A member or steward drafts a GitHub Issue proposal, using a template and the BEN Test (without personal information).
2. Identify the actual adopted Charter / policy authority and whether consultation is required.
3. Obtain independent review, privacy review and a recorded vote *outside the GitHub like counter* under applicable governance rules.
4. Record a sanitised Decision ID, exact version, rationale, effective date and owner in an appropriately permissioned record.
5. Merge a reviewed PR containing the software/doc change, linking the authorised decision ID. Ensure runtime tests and policy copies are updated together.
6. Publish a brief, accurate, member-facing change note and preserve the previous release.

Founders are accountable to the same rules as members. No founder, contributor, sponsor or AI administrator is exempt from appeal or conflict rules. A person involved in a complaint must not access or decide their own case.
