# B.E.N. model card — development-stage AI

**System:** B.E.N. OS v0.3 · **Status:** developer prototype, not independently evaluated or deployed publicly.  
**Base model:** Configured externally through `BEN_MODEL`; Ollama is the default model gateway, with `qwen3:4b-instruct` suggested as a *model identifier to verify locally*, not a statement of the model's weights/license/expertise.  
**Training:** B.E.N. has **not** trained or fine-tuned a new foundation model. It supplies original creative scaffolds, curated organisational notes, instructions and evaluation cases to an existing model.

## Intended tasks

General explanatory assistance to members; training exercises and critique for human creatives; voluntary collaboration guidance; source-linked explanation of the October 2026 proposed operating pack; assistance in preparing non-sensitive agendas and action proposals.

## Not intended

Final human artistic authorship by default; diagnosis, crisis intervention, legal or financial advice, autonomous moderation, official votes, legal incorporation, governmental decisions, secret surveillance, mass profiling, social-credit scoring, use of member messages as training data without separate consent, or direct access to private safeguarding cases.

## Technical boundaries

No external AI tools are connected by default. AI chat is authenticated; model traffic goes to the configured Ollama endpoint. History is bounded and client-side per open page; no chat transcript database writes. The AI cannot act on GitHub. Other member and steward actions are separate server routes requiring membership or explicit operational authorization. This is not a complete assurance against prompt injection, model hallucinations or information disclosure.

## Evaluation required

- Domain quality by human artistic practitioners for all 48 disciplines.
- Authorship-preserving responses, attribution, cultural context, safe critique and appropriate uncertainty.
- Hallucinated claims about B.E.N. adoption, governance, completed events and model capabilities.
- Adversarial tests for prompt injection, tool abuse, leaked sources, data extraction and privilege confusion.
- Performance in multiple languages and screen-reader/mobile environments.
- Cost, energy and environmental impact measurement if hosted inference is introduced.

**Release gate:** no production statement of expert coverage or audited safety until independent testing supports it.
