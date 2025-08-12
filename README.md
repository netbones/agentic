# Agentic Next

A clean-room Next.js + Prisma + Auth.js scaffold for a Gmail + LLM app.

## Stack
- Next.js 15, React 19, TypeScript
- Prisma (Postgres) with optional Accelerate (prisma:// + DIRECT_URL)
- Auth.js (NextAuth v5) with Google
- Env validation with zod (@t3-oss/env-nextjs)
- Token encryption at rest (AES-256-GCM)
- LLM providers: OpenRouter and Mistral via Vercel AI SDK

## Setup
1. Install deps
```
pnpm install
```
2. Configure env
```
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, AUTH_TRUST_HOST,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, EMAIL_ENCRYPT_SECRET, EMAIL_ENCRYPT_SALT,
# OPENROUTER_API_KEY and/or MISTRAL_API_KEY
```
3. Prisma
```
pnpm run prisma:generate
pnpm run prisma:migrate:dev
```
4. Dev
```
pnpm dev
```

## Notes
- Keep secrets out of git.
- This is a baseline; build features incrementally.
