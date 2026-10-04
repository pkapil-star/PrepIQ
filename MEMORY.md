# MEMORY.md — Rolling Project Memory

> Purpose: a new session (human or AI) should be able to read ONLY this file and know exactly
> where the project stands, without re-reading old chat history or the whole codebase.
>
> RULE: Update this file after every main change — a finished feature, a changed decision, a
> scope cut, a new dependency, or the end of a work session. Keep "Current State" accurate and
> overwritten (don't let it go stale); add one line to the "Change Log" every time. Don't let this
> file balloon — if the log gets long, compress older entries into a single summary line.

---

## Current State

*(Last updated: 2026-10-04)*

- Phase: **Pre-hackathon prep** (hackathon starts in ~2 days; 36-hour build window once it starts).
- Repo scaffolded per ARCHITECTURE.md: `frontend/` (React + Vite + Tailwind v4), `backend/`
  (Express, with `/companies`, `/roles/:id/weightage`, `/users/:id/skills`, `/users/:id/plan`,
  `/users/:id/topics/:topicId/review` routes wired to Supabase + `lib/scoring.js`), `data-pipeline/`
  (`extract.js` + `load-to-db.js` stubs calling Claude + Supabase). `backend/sql/schema.sql` has
  the core tables ready to run in Supabase's SQL editor. Git repo initialized, `.gitignore` added.
- Confirmed decisions so far:
  - Backend: Node.js + Express
  - Frontend: React + Vite + Tailwind CSS (**v4** — no `tailwind.config.js`/`postcss.config.js`;
    uses `@tailwindcss/vite` plugin + `@import "tailwindcss";` in `index.css`. ARCHITECTURE.md's
    `npx tailwindcss init -p` step is stale for v4 — don't follow it literally.)
  - Database/Auth: Supabase (Postgres-based, hosted, built-in auth — avoids Docker/self-hosting setup time)
  - LLM provider: Claude API (`claude-sonnet-5`), locked in TRD.md
  - Decay model: linear, 30-day window — locked in TRD.md and implemented in `backend/src/lib/scoring.js`
  - Team size: 3-4 people
  - Timeline: 2 days of prep before the hackathon, then a 36-hour build window
- Backend `npm install` reported 3 high-severity audit warnings (transitive, via nodemon devDependency)
  — not addressed yet, low priority for a hackathon demo; re-check with `npm audit` if time allows.
- Not yet done: Supabase project not created (no real `.env` values yet — only `.env.example`
  placeholders exist in `frontend/`, `backend/`, `data-pipeline/`); no seed data collected; no
  companies/roles rows exist so `load-to-db.js`'s company/role lookup is still a TODO.
- Next concrete step: remaining Phase 0 tasks in `TASK.md` — create the real Supabase project and
  run `backend/sql/schema.sql`, finalize the 15-20 seed companies list, curate raw interview text
  into `data-pipeline/seed/`.

## Open Decisions / Blockers

- Final list of ~15-20 seed companies not yet chosen (see TASK.md Phase 0).
- Team role assignment (who owns which track) not yet finalized among the 3-4 members.

## Change Log

*(Newest first. One line per change: date — what changed — why.)*

- 2026-10-04 — Scaffolded `frontend/`, `backend/`, `data-pipeline/` per ARCHITECTURE.md; added
  `backend/sql/schema.sql`; locked decay rate (linear, 30 days) and LLM provider (Claude) in
  TRD.md; git repo initialized. Phase 0 code-scaffold tasks done — Supabase project creation and
  seed data curation still open.
- 2026-10-04 — Renamed claude.md, memory.md, prd.md, rules.md, task.md, architecture.md to uppercase so cross-doc references match on case-sensitive systems. Added TRD.md (technical requirements, referenced by TASK.md Phase 4). Decay rate still open.
- 2026-10-04 — Created PRD.md, ARCHITECTURE.md, RULES.md, TASK.md, CLAUDE.md, MEMORY.md — project is moving from idea/PRD stage into active build prep.
