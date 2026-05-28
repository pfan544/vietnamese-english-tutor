# DEVLOG

Append entries here as work happens. Newest at the bottom. Keep entries short: date, what changed, why.

## 2026-05-26 — Project scaffolded

Next.js 15 + App Router + TypeScript + Tailwind 4 skeleton created via `create-next-app`.
- Wrote `CLAUDE.md` spec (stack, security rules, pedagogy rules for Vietnamese-L1 phonological targeting).
- Wrote `AGENTS.md` (Next.js 15 breaking-change warning).
- Added `.claude/agents/i18n-linguist.md` subagent definition.
- Added `.claude/scripts/` hooks: `auto-format.sh`, `test-on-stop.sh`, `check-secrets.sh`, `check-bash-safety.sh`.
- Source plan: `C:\Users\paulf\Downloads\Claude Code Power-User Stack and Vietnamese to English Learning App_ Production Playbook.pdf`.

**Not done that day:** `git init`. No commit history exists for the scaffolding session. The conversation that built it was almost certainly in the Claude desktop app (not Claude Code) — find it in the desktop app's chat sidebar and paste a recap below if recovered.

## 2026-05-27 — Recovered the thread, set up persistence

- Discovered project had no git repo and no entry in Claude auto-memory — future sessions had no breadcrumb back to this work.
- **Decision: this project's primary Claude surface is Claude Code running in WSL Ubuntu.** Rationale: `.claude/scripts/*.sh` are bash; `npm run migrate` needs supabase CLI (Linux-first); Playwright installs cleaner on Linux. Use the desktop app for ideation chat only, not for building.
- `git init` + first commit of current state.
- Added DEVLOG.md (this file).
- Added project to Claude auto-memory at `C:\Users\paulf\.claude\projects\C--Program-Files-Git\memory\project_vietnamese_tutor.md` so any future Claude session in any tool can find it.

## Next up

- [ ] Recover and paste the May 26 desktop-app conversation recap (see top of file).
- [ ] Wire Supabase project + first migration (must include `unaccent` extension + ICU collation per CLAUDE.md).
- [ ] Pick one: Drizzle vs Supabase generated client. CLAUDE.md says pick and stick.
- [ ] Replace boilerplate `app/page.tsx` with real landing.
