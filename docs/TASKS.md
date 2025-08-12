# Tasks (v0.2, aligned with PRD v0.2)

## Sprint 1 (MVP Foundation)
- [ ] Env: Copy `.env.example` → `.env` and fill required vars
- [ ] Prisma: `pnpm prisma:generate` and `pnpm prisma:migrate:dev`
- [ ] Auth: Verify Google OAuth sign-in works (`/api/auth/session` returns session)
- [ ] Health: Verify `GET /api/health` returns `{ ok: true }`
- [ ] LLM: Implement `POST /api/llm/generate` with OpenRouter + Mistral providers
- [ ] Gmail: Implement `GET /api/gmail/labels` using Gmail API (users.labels.list)

## Sprint 2 (User Settings + Flows)
- [ ] DB: Add `UserSettings` (userId, llmProvider, llmModel, llmApiKey?)
- [ ] UI: Basic Settings page for selecting provider/model/key
- [ ] LLM: Stream responses; add summarize helper/prompt
- [ ] Gmail: Fetch thread metadata; add "Summarize thread" action

## Sprint 3 (Clutter & Bulk Tools)
- [ ] Unsubscribe: Scan emails for `List-Unsubscribe`/links; show candidates
- [ ] Unsubscribe: Execute http(s) unsubscribes; prepare `mailto:` drafts
- [ ] Clutter: Identify newsletters/promotions; one-click archive/delete

## Sprint 4 (Automations)
- [ ] DB: Add `Automation` and `ExecutionLog`
- [ ] UI: CRUD for rules (name, condition JSON, type, action, enabled, thread)
- [ ] Engine: Executor to apply rules on-demand; log outcomes

## Sprint 5 (Real-time + Scale)
- [ ] Pub/Sub: Set Gmail watch per account; add webhook `POST /api/gmail/webhook`
- [ ] Processing: Fetch deltas by `historyId`; enqueue processing; update UI
- [ ] Performance: Pagination/virtualization for large views; backoff/retry patterns
- [ ] Observability: Add Sentry/PostHog (optional), structured logs

## Testing & Quality (ongoing)
- [ ] Unit: encryption, env, LLM adapter, Gmail client wrapper
- [ ] Integration: auth + LLM + Gmail happy paths
- [ ] E2E: sign-in, list labels, summarize thread
- [ ] Rate limits & error handling (retry/backoff)

## Release Readiness
- [ ] SECURITY.md review; verify no secrets committed
- [ ] License & third-party review (ensure no AGPL code)
- [ ] Deployment docs for Vercel (envs, DB, OAuth)
