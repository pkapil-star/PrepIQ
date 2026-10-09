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

*(Last updated: 2026-10-05)*

- Phase: **Pre-hackathon prep**, solo build. Product is now **job-title-first roadmap** (see
  PRD.md "User Flow"); PRD, TRD, ARCHITECTURE all rewritten to match.
- Stack: Node + Express backend, React + Vite + Tailwind **v4** frontend (no `tailwind.config.js`;
  uses `@tailwindcss/vite` — ARCHITECTURE.md's `npx tailwindcss init -p` step is stale), Supabase
  (Postgres + Auth). Extraction runs in a Claude Code session — no Anthropic API key needed.
- **Backend redesigned (code written, not yet run against the DB):**
  - `backend/sql/schema.sql` — new schema: `job_titles` (8 seeded), `topics` (subject, level,
    est_hours), `baseline_weights`, `company_topic_weights`, `interview_experiences`,
    `user_profiles`, `user_topics`, `roadmaps`. Keeps `companies`; drops old `roles`,
    `role_topic_weightage`, `user_skill_ratings`, `revision_plans`. **Not yet run in Supabase**
    (drops the 23 seeded `roles` rows — waiting on user OK).
  - Routes: `GET /job-titles`, `GET /companies`, `GET /job-titles/:id/topics?bucket=`, and
    JWT-protected `/me/profile`, `/me/skills`, `/me/roadmap`, `/me/topics/:id/complete`.
  - `lib/roadmap.js` — roadmap builder (tested on sample data); `lib/auth.js` — JWT check.
  - Old `routes/roles.js`, `routes/users.js`, `lib/scoring.js` deleted.
- Data pipeline: `seed-companies-roles.js` now seeds companies only (19 live in Supabase).
  `seed/baseline.json` is a **template** (2 example rows) — user is writing the real curated topics
  + weights; `seed-baseline.js` loads it. `load-to-db.js` loads `structured/<company>__<title>.json`
  into `company_topic_weights`.
- Frontend: `api/client.js` rewritten for the new routes (takes Supabase access token). No UI
  screens yet; `@supabase/supabase-js` not yet installed in `frontend/`; no `frontend/.env`.
- Backend `npm install` has 3 high-severity audit warnings (transitive via nodemon) — low priority.
- Next steps: (1) run new `schema.sql` in Supabase; (2) fill `seed/baseline.json` and run
  `seed-baseline.js`; (3) build frontend screens: login, profile, self-assessment, roadmap,
  download, progress; (4) curate interview posts for company blending.

## Open Decisions / Blockers

- Team is solo — if time runs short, cut auth first (demo user), then company blending.
- `seed/baseline.json` real content (topics x 8 job titles x 6 buckets) not written yet — blocks
  meaningful roadmaps.
- Self-assessment MCQ options and their 0-1 mapping not designed yet.
- PDF/DOCX generation method not chosen (browser print vs a library).

## Change Log

*(Newest first. One line per change: date — what changed — why.)*

- 2026-10-05 — Backend + docs redesigned for the job-title-first flow: new `schema.sql` (not yet
  run), routes `jobTitles.js` + `me.js`, `lib/roadmap.js` + `lib/auth.js`, deleted old
  roles/users/scoring files; TRD and ARCHITECTURE rewritten; `seed/baseline.json` template +
  `seed-baseline.js`; `load-to-db.js` now loads company weights; frontend `api/client.js` updated.
  Decisions: no System Design/Behavioral, 50/50 company blend, user writes baseline weights.
- 2026-10-05 — **Product pivot: job-title-first roadmap.** PRD.md rewritten. Flow: login ->
  student (first-timer / interviewed / internship) or working (1-2 / 2-4 / 4+ yrs) -> job title
  (8 tracks: SDE, FDE, Cloud, Cyber, Frontend/Backend/Full-stack, Data/ML, DevOps/SRE, QA/SDET)
  -> optional company -> weeks + hours/day -> self-assessment form (quiz dropped) -> week-by-week
  beginner-to-advanced roadmap (template, no live LLM) -> PDF + DOCX download (paid later) ->
  progress tracker with 30-day revision flag. Weights = curated baseline per title x experience +
  interview-data adjustment. Subjects: DSA, OS, DBMS, CN, OOP, role-specific. **Stale now:** TRD
  FRs + API contract, ARCHITECTURE tables, `backend/sql/schema.sql` (roles tied to company,
  old experience buckets), backend routes.
- 2026-10-05 — More decisions in TRD.md: extraction done in a Claude Code session (no API key
  needed — removes the API-key blocker); quiz questions LLM-generated offline into a new
  `quiz_questions` table; quiz score overrides self-rating. Team is currently **solo** (one
  person), so track split in TASK.md doesn't apply yet.
- 2026-10-05 — Planning decisions locked in TRD.md: interview text is manually curated real posts;
  auth is Supabase Auth (browser uses anon key for login only, backend verifies JWT — NFR-4
  reworded); skill check uses both self-rating and a per-topic quiz (quiz design still open).

- 2026-10-04 — Locked 19-company/23-role seed list (`data-pipeline/seed/companies-roles.json`);
  loaded into Supabase via new `data-pipeline/seed-companies-roles.js`. Added missing `dotenv`
  dependency to `data-pipeline` (was required by `extract.js`/`load-to-db.js` but never installed).
- 2026-10-04 — Created real Supabase project; ran `backend/sql/schema.sql` via SQL editor — core
  tables confirmed live. Filled `backend/.env` and `data-pipeline/.env` with real project URL +
  service_role key (caught and fixed a near-miss: real key was briefly pasted into the tracked
  `backend/.env.example` instead of a gitignored `.env` — reverted before any commit).
- 2026-10-04 — Scaffolded `frontend/`, `backend/`, `data-pipeline/` per ARCHITECTURE.md; added
  `backend/sql/schema.sql`; locked decay rate (linear, 30 days) and LLM provider (Claude) in
  TRD.md; git repo initialized. Phase 0 code-scaffold tasks done — Supabase project creation and
  seed data curation still open.
- 2026-10-04 — Renamed claude.md, memory.md, prd.md, rules.md, task.md, architecture.md to uppercase so cross-doc references match on case-sensitive systems. Added TRD.md (technical requirements, referenced by TASK.md Phase 4). Decay rate still open.
- 2026-10-04 — Created PRD.md, ARCHITECTURE.md, RULES.md, TASK.md, CLAUDE.md, MEMORY.md — project is moving from idea/PRD stage into active build prep.
