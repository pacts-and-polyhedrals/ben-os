# B.E.N. open-source and responsible reuse strategy

**Status: proposal for founder vote — no code license has yet been granted for public redistribution.** The initial prototype's `package.json` is marked `UNLICENSED` to avoid silently asserting legal rights. Do not call an unlicensed repository 'open source' simply because its source can be viewed.

## Why openness matters

B.E.N. is designed to avoid a single corporation, administrator or founder taking permanent control over knowledge, governance or access. Transparent source code, portable records, meaningful community participation and reproducible tests can help people inspect and improve the tools they depend on. Public code alone does not guarantee fair governance or ecological responsibility.

## Founder choice — recommended software license

**Recommended, subject to rights/legal review: GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)** for the B.E.N. application and AI orchestration source code. Its network-service provision generally requires operators distributing modified versions via a network to offer corresponding source to their users. Trade-offs: strong reciprocity but less compatibility with some proprietary integrations; conditions apply and legal advice is recommended. On adoption, obtain the official full license text from GNU, add `LICENSE`, update SPDX identifiers and package metadata, and add copyright/notice records. Do not attempt to add behavioural restrictions (e.g. 'no greedy people') and still call it OSI-compliant open source.

**Alternative:** Apache License 2.0 for maximum technical adoption and permissive commercial reuse, including by companies that do not release modifications. The founders should explicitly debate whether that possibility aligns with the organisation's mission. **Another alternative:** MPL-2.0 for file-level reciprocity with easier mixed licensing.

The terms of **model weights** are separate from the B.E.N. source-code license. An 'open-weight' model is not automatically open-source under OSI criteria; the model's own license, privacy and commercial rights must be reviewed. The same applies to art, logos, music, brand names, photographs, educational references and third-party code.

## Documentation and original educational resources

Recommended after rights review: **CC BY-SA 4.0** for original text materials where all authors consent. Never retroactively relicense founding Bens' private documents or creative works without authority. Prefer links and short original explanations over copying third-party educational content.

## Contributor rights

Establish a Developer Certificate of Origin process or carefully reviewed contribution agreement, code of conduct, accessible contribution guide and review committee. Never require exclusive copyright assignment to one founder. Contributions from artists, instructors and authors must retain clear credit and agreed permissions. Show AI involvement when material and avoid claims of human vetting that have not occurred.

## Public vs private repositories

Suggested separation:

- `ben-os` — review-stage application, public only after licence/security/privacy checks.
- `ben-public` — approved public-facing site and policy copies, can publish via GitHub Pages.
- `ben-operations` — private non-sensitive founder tasks/issue links; no casework or member lists.
- `ben-evaluations` — non-sensitive redacted AI test cases and scores after review.
- **NOT GitHub:** sensitive casework, member authentication records, confidential evidence, payment credentials, medical history, private messages and personal identity documents.

Member sign-in with GitHub does not make the member a repo collaborator. The web app uses its own database and local roles; a tightly scoped GitHub App installation mediates only explicitly reviewed non-sensitive repository actions.

## Transparency before global expansion

Publish an honest model card, data card, sustainability statement, source/release history, security contact, review outcomes and disclosure of meaningful sponsors. A financial contribution never buys more votes, immunity from the Code or exclusion rights over other members.

## Action required for the first public release

1. Verify who owns or has permission to license all existing source and assets.
2. Record the human vote adopting a software license and documentation/artwork policies.
3. Add complete, canonical license text and SPDX metadata; check external dependencies and model terms.
4. Redact and scan repository history for secrets and private personal records.
5. Publish a model card, AI ethics charter, contribution rules, vulnerability disclosure route and reproducible CI.
6. Document known limitations and conduct independent security and accessibility review.

Until those gates are met, distribute the prototype only to authorised founders for evaluation, not as a general public open-source package.
