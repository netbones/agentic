# Design (v0.2, aligned with PRD v0.2)

## 1. Architecture Overview
- Next.js 15 (App Router) for UI and API routes; deployable to Vercel or similar
- Prisma ORM (Postgres). Optional Prisma Accelerate when `DATABASE_URL` uses `prisma://` and `DIRECT_URL` is provided
- Auth.js (NextAuth v5) with Google provider; JWT sessions
- Env validation via `@t3-oss/env-nextjs` + zod; strict server-only secrets
- Token encryption at rest: AES-256-GCM with PBKDF2-derived key (secret + salt)
- LLM provider registry using Vercel AI SDK (OpenRouter, Mistral)
- Optional Redis for rate-limiting/queues (future)
- Optional Pub/Sub webhook for real-time Gmail updates (Phase 3+)

## 2. Components
- Web UI (Next.js): Sign-in, simple dashboard, settings, test actions (LLM, list labels)
- Auth Layer (NextAuth): Google OAuth; Prisma adapter persists users/accounts; refresh-token rotation
- Data Layer (Prisma): Postgres schema for User, Account (MVP). Later: UserSettings, EmailAccount, Thread, Message, Automation, ExecutionLog
- LLM Service: Small adapter that selects provider/model and calls Vercel AI SDK
- Gmail Service: OAuth scopes, token refresh, label/message/thread helpers
- Automations Engine (Phase 3/4): Evaluate conditions; apply actions; log executions
- Unsubscribe Service (Phase 3/4): Scan for List‑Unsubscribe headers; follow http/mailto links with user consent
- Real-time Updates (Phase 5): Gmail watch → Pub/Sub → webhook → queue → UI refresh

## 3. Data Model (MVP → Future)
- User(id, email, name, image, createdAt, updatedAt)
- Account(id, userId, provider, providerAccountId, access_token, refresh_token, expires_at, ...)
- (Future) UserSettings(userId, llmProvider, llmModel, llmApiKey?)
- (Future) EmailAccount(id, userId, email, provider, accountId)
- (Future) Label(id, emailAccountId, name)
- (Future) Thread(id, emailAccountId, externalId, subject, metadata)
- (Future) Message(id, threadId, externalId, headers, snippet, bodyRef)
- (Future) Automation(id, userId, name, conditionJson, type, action, enabled, applyThread)
- (Future) ExecutionLog(id, automationId, targetId, status, error, createdAt)

Tokens (access/refresh) are stored on Account and transparently encrypted/decrypted via Prisma extension.

## 4. API Surface
- Auth: `/api/auth/*` (NextAuth)
- Health: `GET /api/health`
- LLM: `POST /api/llm/generate` { provider, model, input } → { text | JSON }
- Gmail: `GET /api/gmail/labels` → [{ id, name }]
- (Later)
  - Gmail threads/messages endpoints
  - Unsubscribe scan/execute endpoints
  - Automations CRUD + run endpoints
  - Pub/Sub webhook: `POST /api/gmail/webhook`

## 5. Sequences
### Auth
1) Client → `/api/auth/signin` → Google OAuth
2) Callback persists Account (encrypted tokens) and User via Prisma adapter
3) JWT session issued; `/api/auth/session` returns session

### LLM Generate
1) Client sends provider/model/input to `/api/llm/generate`
2) Server selects provider via adapter; calls Vercel AI SDK; returns streamed or full result

### Gmail Labels (MVP)
1) Server loads Account tokens, refreshes if expired
2) Calls Gmail users.labels.list; returns normalized list

### Bulk Unsubscribe (Phase 3)
1) Scan messages for `List-Unsubscribe` header and HTML unsubscribe links
2) Present candidates to user; on confirm, follow http/https links; for `mailto:` prepare template draft
3) Mark in local DB to avoid duplicate unsubscribes; allow block label

### Automations (Phase 4)
1) CRUD UI for rules; persist JSON conditions and selected actions
2) Executor runs on demand or scheduled; fetches target messages; applies actions via Gmail API
3) Log results in ExecutionLog

### Real-time (Phase 5)
1) Onboarding sets Gmail watch (per account) with Pub/Sub topic
2) Webhook receives historyId → fetch delta → enqueue processing → update UI state

## 6. Gmail Integration Details
- Scopes (minimum MVP): `gmail.modify`, `gmail.settings.basic`, `openid email profile`
- Token Refresh: On expiry, exchange refresh_token at Google token endpoint; update encrypted tokens in DB
- Rate Limiting: Retry with exponential backoff on 429/5xx; batch label reads when possible; respect per-user quotas
- Pagination: Use pageToken for thread/message listing
- Data Minimization: Store minimal pointers (ids/metadata); fetch bodies on-demand

## 7. LLM Provider Abstraction
- Config supports `openrouter` and `mistral`; later add Google/Groq
- UserSettings allows BYO key (optional) or fallback to system keys
- Stream responses for better UX (later)

## 8. Security & Privacy
- AES‑256‑GCM token encryption; key via PBKDF2(secret + salt)
- Env validation at startup; fail fast on missing critical vars
- No tokens/PII in logs; error redaction; structured JSON logging
- Principle of least privilege (DB user perms, OAuth scopes)
- Auditability: ExecutionLog for automations (later)

## 9. Observability & Reliability
- Health endpoint, structured logs, clear error codes
- Backoff/retry for Gmail/LLM with circuit breaker pattern (later)
- Optional Sentry/PostHog later

## 10. Performance & Accessibility Targets
- First paint < 2s; summary generation < 5s; handle views of 1,000 items with pagination/virtualization (later)
- WCAG 2.1 AA baseline (focus order, labels, contrast)

## 11. Configuration
- `.env` (server): DATABASE_URL, DIRECT_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, AUTH_TRUST_HOST, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, EMAIL_ENCRYPT_SECRET, EMAIL_ENCRYPT_SALT, OPENROUTER_API_KEY?, MISTRAL_API_KEY?

## 12. Extensibility
- Add providers by extending LLM adapter
- Add Gmail features incrementally (threads/messages, send/reply)
- Introduce queues/Redis if background processing grows
- Introduce Pub/Sub + webhook once stability is proven
