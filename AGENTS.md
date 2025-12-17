# AGENTS – Dragonfire Games

## Context
- Purpose: information-first site for Dragonfire Games (events, store info, card pull requests) with a simple admin workflow.
- Mood: welcoming, calm, community-oriented, utilitarian; clarity over flash or conversion.
- Scope: public pages (Home, About, Events + detail, Card Request) and a Clerk-protected admin dashboard for events + card requests. No e-commerce.

## Tech / Patterns
- Next.js (Pages Router) + TypeScript, using Bun as the package manager.
- Tailwind CSS v4 (inline `@theme` tokens for palette + fonts).
- Supabase for data (Postgres + optional storage), no Supabase auth.
- Clerk for admin authentication; protect `/admin/*` via middleware.
- Deploy on Vercel; use API routes for server logic.
- Path alias `@/*` -> `src/*`.
- Admin ACL: temporary allowlist via `CLERK_ADMIN_USER_IDS`; replace with proper Clerk roles/permissions later.

## Auth Notes
- Clerk pages-router setup with `ClerkProvider` in `_app.tsx`.
- `src/proxy.ts` uses `clerkMiddleware`; add `.env.local` with publishable + secret keys (already gitignored).
- Admin-only routes live under `/admin/*`.

## Feature Expectations (MVP)
- Public: Home, About, Events list + event detail, Card Request form (decklist-style input).
- Admin: event CRUD; card request review with statuses, item availability flags, outbound messages log.
- Events: recurring + one-off + tournaments; fields include title, time, type, game tags, entry fee, description, external registration link.
- Card requests: parse quantities/name/set/collector number; store raw lines; allow email notification on submit.

## Build Priorities
1) Scaffold + base styling (done).
2) Supabase schema + API routes (events, card requests).
3) Clerk auth + `/admin/*` protection.
4) Public pages and event detail.
5) Admin event CRUD.
6) Card request form + admin dashboard.
7) Email notifications, polish, deployment.
