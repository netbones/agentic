# Product Requirements Document (PRD)

Product: Agentic Next (AI‑Powered Gmail Assistant)
Owner: Netbones
Status: Draft v0.2 (merged)

## Version History
| Version | Date       | Author     | Changes |
|--------:|------------|------------|---------|
| 0.1     | 2025‑08‑12 | Netbones   | Initial PRD (MVP‑focused) |
| 0.2     | 2025‑08‑12 | Netbones   | Merged with PRD_NEW (scope, stories, acceptance criteria, NFRs) |

## 1. Purpose and Vision
Build a secure, proprietary (non‑AGPL) email assistant that connects to Gmail, analyzes emails with LLMs, and provides automation primitives (summaries, categorization, actions) with strong privacy controls and clear auditability. Hosted on Vercel or similar serverless platform.

## 2. Scope
- In Scope (Program goals):
  - Google OAuth sign‑in; manage existing Gmail mailboxes
  - AI summaries for emails/threads; AI‑assisted replies
  - Clutter clearing and bulk unsubscribe/blocking
  - Label management and automations (rules)
  - Real‑time updates via Pub/Sub (Phase 3+)
- Out of Scope (MVP):
  - Non‑Gmail providers; full mail client parity; on‑prem hosting
  - Advanced composition (rich media), payments/seats/analytics

## 3. Target Users
- Busy professionals who need help triaging inboxes
- Teams evaluating AI‑assisted email workflows (self‑host or managed)

## 4. User Stories
- As a busy professional, I want inbox/thread summaries to quickly grasp key items.
- As a user overwhelmed by spam, I want to clear clutter and bulk unsubscribe/block.
- As an email manager, I want meaningful labels and automations to keep things organized.
- As a responder, I want AI‑assisted replies based on simple prompts.
- As a real‑time user, I want inbox updates reflected without manual refresh (Pub/Sub later).

## 5. Functional Requirements (MVP → Later)
1) Authentication & Mailbox Mgmt
- SHALL authenticate via OAuth 2.0 with Gmail scopes (read, modify, labels)
- MAY support multiple mailboxes per user (later)

2) Summaries & Viewing
- SHALL generate AI summaries for an email/thread on demand (<= 5s target)
- SHALL provide raw content view alongside summaries

3) Actions
- SHALL enable AI‑assisted responses (drafts editable before sending)
- SHALL support reply/forward/archive/delete/mark read/unread

4) Clutter & Bulk Tools
- SHALL identify clutter (newsletters/promotions) and allow one‑click clear
- SHALL provide bulk unsubscribe/block tools

5) Labels & Automations
- SHALL create labels (with AI suggestions)
- SHALL support automations with fields: name, condition, type, action, enabled (bool), thread (bool)
- SHOULD map to Gmail filters where possible, enhanced by AI

6) Real‑time Updates (Phase 3+)
- SHALL use Pub/Sub watch + webhook to refresh inbox state

## 6. Acceptance Criteria (selected)
- Authentication
  - WHEN user logs in THEN redirect to Google OAuth and grant specified scopes
  - WHEN multiple mailboxes connected THEN user can switch between them (if enabled later)
- Summaries
  - WHEN viewing an email/thread THEN an AI summary appears within 5 seconds
  - WHEN requesting inbox overview THEN summarize top N (e.g., 10) items by AI priority
- Actions
  - WHEN generating a response THEN AI creates an editable draft before send
  - WHEN bulk actions requested THEN process up to 100 emails without errors
- Clutter
  - WHEN scanning THEN list items with unsubscribe links (where present)
  - WHEN bulk unsubscribe THEN follow links, confirm unsubscribes, optionally block
- Labels & Automations
  - WHEN creating a label THEN suggest names based on patterns
  - WHEN setting an automation THEN validate fields and apply via Gmail API
- Real‑time
  - WHEN Pub/Sub notifies THEN UI refreshes inbox state (Phase 3+)

## 7. Non‑Functional Requirements
- Performance: initial page < 2s; summaries < 5s; handle 1,000 items in view
- Scalability: serverless functions scale automatically; Pub/Sub for volume
- Security: HTTPS only; OAuth tokens encrypted at rest (AES‑256‑GCM); privacy by design; GDPR‑ready
- Accessibility: WCAG 2.1 AA (keyboard navigation, screen readers)
- Reliability: 99.9% target; handle API rate limits with backoff/retry
- Observability: structured logs; error boundaries; health endpoint

## 8. Assumptions & Constraints
- Users grant OAuth permissions; AI providers via API (OpenRouter/Mistral initially)
- Vercel hosting; optional Edge/KV for sessions later
- Compliance with Google API terms and rate limits
- Clean‑room code (no AGPL); Next.js 15, Node 22+, Postgres 14+

## 9. Data Model (MVP)
- User(id, email, name, image, createdAt, updatedAt)
- Account(id, userId, provider, providerAccountId, access_token, refresh_token, expires_at, …)
- (Later) EmailAccount, Thread, Message, Automation, Label

## 10. APIs (MVP)
- Auth: NextAuth routes
- Health: GET /api/health (ok, ts)
- LLM: POST /api/llm/generate { provider, model, input } → { text/JSON }
- Gmail: GET /api/gmail/labels → [{ id, name }]
- (Later) Gmail: thread fetch/summarize; unsubscribe scan; rules endpoints; Pub/Sub webhook

## 11. Security & Privacy
- Encrypt all tokens at rest (AES‑256‑GCM, PBKDF2‑derived key)
- Strict env validation; no PII in logs; redaction filters
- User can bring their own LLM API key; configurable providers

## 12. Roadmap
- MVP (Sprints 1‑2): Auth, Prisma schema, token encryption, LLM generate, Gmail labels
- Sprint 3: Thread fetch + summarization; settings UI; provider picker
- Sprint 4: Clutter/bulk unsubscribe; basic automations; labeling
- Sprint 5+: Pub/Sub real‑time, bulk operations scale, analytics, teams

## 13. Testing Strategy
- Unit tests for encryption/env/LLM adapters and Gmail client wrappers
- Integration tests for auth + basic Gmail + LLM generate
- E2E smoke: sign‑in, list labels, summarize thread
- Rate‑limit + error handling scenarios; backoff/retry coverage

## 14. Risks & Mitigations
- API rate limits → caching/batching/backoff and user feedback
- AI inaccuracies → user feedback loop; show raw text fallback
- Pub/Sub complexity → automate setup; graceful degradation when unavailable
