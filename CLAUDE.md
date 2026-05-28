# Vietnamese → English Learning Web App

## Mission

Build a free-tier, web-based English-learning app for Vietnamese L1 speakers, targeting CEFR A2–B1. The pedagogical edge over generic apps is explicit targeting of well-documented Vietnamese-L1 phonological challenges (final consonants, clusters, voiced/voiceless contrasts, dental fricatives, tense/lax vowels, stress placement).

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 4
- **UI**: shadcn/ui (Radix primitives), lucide-react icons
- **State**: TanStack Query (server state), Zustand (local state)
- **Forms**: react-hook-form + zod
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions/Deno)
- **ORM**: Drizzle OR Supabase's generated TypeScript client (pick one and stay consistent)
- **SRS**: `ts-fsrs` (Free Spaced Repetition Scheduler, MIT, open-spaced-repetition)
- **Speech**: Web Speech API (in-browser, free) + Google Cloud TTS (vi-VN fallback, 1M chars/mo free)
- **LLM**: Anthropic Messages API, server-side only
  - `claude-haiku-4-5` → grammar correction, vocab explanations, high-volume scoring
  - `claude-sonnet-4-6` → conversation partner, pronunciation feedback
  - `claude-opus-4-7` → lesson generation (rare; one-shot)
- **Testing**: Vitest (unit), Playwright (E2E, driven via Playwright MCP)
- **Hosting**: Vercel (Hobby during dev → Pro at launch)
- **CI**: GitHub Actions with `anthropics/claude-code-action@v1`

## Conventions

- TypeScript strict mode. No `any` without an inline TODO justifying it.
- Server-only modules use `import "server-only"` at the top.
- Server Components by default; reach for `"use client"` only when interactive.
- File naming: kebab-case for files, PascalCase for components, camelCase for utilities.
- Database columns: `snake_case`. TypeScript fields: `camelCase`. Map at the boundary.
- Tailwind classes ordered per the Prettier plugin (already wired in `.prettierrc`).
- Prefer Server Actions over Route Handlers when the call is initiated from a form.
- Imports sorted: external → `@/*` aliases → relative.

## Security (non-negotiable)

- **No keyed API calls from client code.** Anthropic, Google Cloud TTS, anything with a secret — all proxied through Next.js Route Handlers.
- **No secrets in the repo.** `.env.local` is gitignored. Use `.env.example` for templates with placeholder values.
- **Supabase RLS on every per-user table.** Default deny; allow only `user_id = auth.uid()` reads/writes. Anonymous users may read content tables (`cards`, `lessons`) but never write.
- **Migrations include their RLS policies in the same file** as the table definition. Reviewing one file shows the full security posture.
- **Rate-limit every `/api/*` Route Handler** — per IP and per `user_id`.
- **Daily per-user token cap** enforced server-side via `usage_log` table (default 50K input + 10K output). Reject the request before calling Anthropic.
- **No `pull_request_target` in workflows.** Use plain `pull_request` so fork PRs don't get repo secrets.
- **Pin Claude Code action versions** in CI; don't track `@v1` floating tag once you're past initial setup.

## Pedagogical Principles (encode in code AND content)

The target learner is a Vietnamese L1 speaker. Generic vocabulary drills are a commodity; the differentiator is explicit targeting of Vietnamese-L1 challenges:

- **Final consonants**: Vietnamese omits/replaces final /z, s, t, v, d, k, p, θ, ð, ʃ/. Weight final consonants **2×** in pronunciation scoring because final -s and -ed carry grammatical meaning.
- **Consonant clusters**: Hardest are final /sts/, /ts/, /str/, /tr/ and onset /str/, /spl/, /spr/, /skr/, /pr/, /tr/, /br/. Drill progressively (/s/+plosive → /s/+plosive+liquid).
- **Voiced/voiceless contrasts**: /p↔b/, /k↔g/, /t↔d/, /s↔z/, /f↔v/.
- **Dental fricatives**: /θ/ ("think") and /ð/ ("the") — not in Vietnamese.
- **Tense/lax vowels**: /iː↔ɪ/, /uː↔ʊ/, /æ↔e/, /ɑː↔ʌ/ minimal pairs.
- **Stress**: Show explicit syllable stress markers for 3+ syllable words; flag flat-pitch English as "tone interference" in the UI.
- **Every card targeting a high-confusion sound has a minimal-pair partner** stored in the same deck.
- **Gamification**: streaks, daily XP, **self-comparison** leaderboards only. No social leaderboards — research consistently shows they hurt adult-learner retention.

## Commands

- `npm run dev` — local dev server on :3000
- `npm test` — Vitest + `tsc --noEmit` + Playwright E2E (in that order; Stop hook depends on this)
- `npm run lint` — eslint + prettier check
- `npm run format` — prettier --write
- `npm run typecheck` — tsc --noEmit
- `npm run migrate` — `supabase db push`
- `npm run gen:types` — `supabase gen types typescript --local > src/lib/database.types.ts`

## Subagents (`.claude/agents/`)

- `code-reviewer` — diff review against security + style (Sonnet)
- `test-writer` — Vitest + Playwright tests (Sonnet)
- `db-architect` — schema, RLS, migrations (Sonnet, Supabase MCP)
- `i18n-linguist` — Vietnamese↔English content + IPA review (Opus, read-only)
- `security-auditor` — OWASP + RLS audit on demand (Opus, read-only)

## MCP Servers

- **Supabase** — scoped `read_only=true` during initial dev; flip after schema is stable
- **Playwright** — E2E test authoring + execution
- **GitHub** — issues, PRs, code search
- **Context7** — pull live framework docs whenever working with Next.js 15 App Router or Supabase SDK to avoid stale-API hallucinations

## Pitfalls to Avoid

- Vercel Hobby is **non-commercial** — flip to Pro before charging anyone or adding a Buy Me a Coffee button.
- Supabase Free **pauses after 7 days idle** — upgrade to Pro before launch.
- Supabase needs the `unaccent` extension + ICU collation for Vietnamese diacritic-tolerant search — wire this in the first migration, not later.
- Web Speech API confidence scores are biased against L2 speakers — always provide an "I think it was right" override and use the LLM-as-judge layer for coaching.
- No `localStorage` reliance for review state — always reconcile against the server `reviews` table.
- Don't reproduce copyrighted English-learning content. Original content only.

## Out of Scope (MVP)

- Native mobile apps (web/PWA only).
- Real-time multiplayer or social features.
- Tonal Vietnamese pronunciation drills (we teach English, not Vietnamese).
- Payment processing (defer until we have an offer to sell).
