# ARCHITECTURE.md — PrepIQ Technical Architecture

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite + Tailwind CSS | Fast to build, matches the team's existing web dev skillset |
| Backend API | Node.js + Express | Familiar, quick to stand up REST endpoints under hackathon time pressure |
| Database + Auth | **Supabase** (Postgres under the hood, hosted) | Relational fit for company/role/topic tables, built-in auth, no Docker/self-hosting setup time needed during the hackathon |
| AI / LLM | Claude API (default) or OpenAI API | Used offline for structured extraction from raw interview text |
| Hosting (frontend) | Vercel or Netlify | One-command deploy, free tier |
| Hosting (backend) | Render or Railway | Free/low-cost, quick to deploy an Express service |
| Data curation | Node/Python scripts + a JSON/CSV seed file | Fastest path to a reliable seed dataset without live scraping |

> If Supabase has setup issues on the day, the fallback is a local Dockerized Postgres — the
> backend talks to Postgres through the same client either way, so this swap should be cheap.

## Required Tools & Setup

Check each item below before you start; install whatever's missing so nobody loses hackathon
time mid-build on a missing dependency. Run the check command — if it errors or shows nothing,
install it.

### Core (everyone needs these)

| Tool | Check | Install |
| --- | --- | --- |
| Node.js (v18+ LTS) | `node -v` | https://nodejs.org or `nvm install --lts` |
| npm (ships with Node) | `npm -v` | comes with Node.js |
| Git | `git --version` | https://git-scm.com/downloads |

### Frontend (Track B)

| Tool | Check | Install |
| --- | --- | --- |
| Vite + React scaffold | — | `npm create vite@latest frontend -- --template react` (run once, inside the repo) |
| Tailwind CSS | — | inside `frontend/`: `npm install -D tailwindcss postcss autoprefixer` then `npx tailwindcss init -p` |

### Backend (Track A)

| Tool | Check | Install |
| --- | --- | --- |
| Express | — | inside `backend/`: `npm install express` |
| nodemon (dev auto-restart) | `npx nodemon -v` | inside `backend/`: `npm install -D nodemon` |
| CORS middleware | — | inside `backend/`: `npm install cors` |
| dotenv (env vars) | — | inside `backend/`: `npm install dotenv` |

### Database & Auth — Supabase (Track A)

| Tool | Check | Install |
| --- | --- | --- |
| Supabase account + project | — | sign up at https://supabase.com, create a project, copy the Project URL + anon/service-role keys into `.env` |
| `@supabase/supabase-js` (client library) | — | `npm install @supabase/supabase-js` in both `backend/` and `data-pipeline/` |
| Supabase CLI (optional — only for local dev/migrations) | `supabase --version` | `npm install -g supabase` |
| Fallback: Docker + Docker Compose (only if Supabase breaks on the day) | `docker --version` and `docker compose version` | https://www.docker.com/products/docker-desktop |

### AI / LLM — for the extraction pipeline (Track C)

| Tool | Check | Install |
| --- | --- | --- |
| Anthropic API key (Claude, default choice) | — | sign up at https://console.anthropic.com, generate a key, put it in `.env` as `ANTHROPIC_API_KEY` |
| `@anthropic-ai/sdk` | — | `npm install @anthropic-ai/sdk` in `data-pipeline/` |
| (Alternative) OpenAI API key + `openai` package | — | only if switching providers — see MEMORY.md open decisions |

### Dev tools (recommended, not strictly required)

| Tool | Check | Install |
| --- | --- | --- |
| A REST client (Postman, Insomnia, or VS Code's Thunder Client) | — | for testing backend endpoints before the frontend is wired up |
| ESLint + Prettier (editor extensions) | — | keeps code style consistent across 3-4 people without manual nitpicking |

### Hosting / Deployment — needed in Phase 4, not day one

| Tool | Check | Install |
| --- | --- | --- |
| Vercel CLI (optional — dashboard + GitHub integration also works) | `vercel --version` | `npm install -g vercel` |
| Netlify CLI (alternative to Vercel) | `netlify --version` | `npm install -g netlify-cli` |
| Render or Railway account | — | sign up at https://render.com or https://railway.app; deploy via their GitHub integration, no CLI required |

### One-shot check (core tools only)

```bash
node -v && npm -v && git --version
```

If any of those three error out, stop and fix that before touching the repo — everything else
builds on top of Node + npm + Git.

## Folder Structure (monorepo)

```
prepiq/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/       # UI building blocks (Selector, WeightageView, PlanList, ...)
│   │   ├── pages/             # Top-level routed views
│   │   ├── api/                # Thin fetch wrappers around backend endpoints
│   │   └── App.jsx
│   └── package.json
├── backend/                   # Express API
│   ├── src/
│   │   ├── routes/             # One file per resource (companies, roles, plan, skills)
│   │   ├── lib/                  # gap-priority scoring, decay logic, supabase client
│   │   └── server.js
│   └── package.json
├── data-pipeline/             # Offline LLM extraction pipeline (run before/during hackathon, not per-request)
│   ├── seed/                   # Curated raw interview-experience text per company/role
│   ├── extract.js              # Calls the LLM, writes structured output
│   └── load-to-db.js           # Pushes structured output into Supabase
├── docs/                        # (optional) anything beyond the root-level planning docs
├── PRD.md
├── ARCHITECTURE.md
├── RULES.md
├── TASK.md
├── CLAUDE.md
└── MEMORY.md
```

Keep this structure fixed for the hackathon — don't add new top-level folders mid-build without
updating this file and MEMORY.md.

## Data Flow

**Live request path** (what happens when a user uses the app):

```
User -> Frontend (React) -> Backend API (Express) -> Supabase (Postgres)
                                    |
                                    v
                            LLM Service (on-demand only,
                            e.g. topic explanations — never
                            on the core ranked-plan path)
```

**Offline pipeline** (run ahead of time, not per user request):

```
Curated interview-experience text (data-pipeline/seed/)
        -> LLM extraction (extract.js)
        -> structured topic/round records
        -> loaded into Supabase (load-to-db.js)
```

The backend's core ranked-plan endpoint only ever reads the already-structured tables in
Supabase — it never waits on an LLM call. This keeps the demo fast and reliable.

## Core Algorithm (summary — see PRD.md for full context)

For a chosen company + role + experience level, each topic gets a priority score:

```
P_t = w_t * (1 - s_t)
```

- `w_t` = that topic's weightage for the selected role (0-1, from the `role_topic_weightage` table)
- `s_t` = the user's normalized skill rating for that topic (0-1, self-rated or quiz-derived)
- Topics are sorted descending by `P_t` to produce the ranked revision list
- `s_t` decays linearly the longer since `last_reviewed_at`, which resurfaces forgotten topics

## Component Connections

- **Frontend `api/` layer** talks only to the Backend API — never directly to Supabase from the
  browser, so the scoring logic and the LLM key stay server-side.
- **Backend `routes/`** are thin — they validate input, call a function in `lib/`, and return JSON.
- **Backend `lib/`** holds the actual logic (scoring, decay, Supabase queries) so it's testable
  and reusable across routes.
- **`data-pipeline/`** is intentionally separate from `backend/` — it runs as a script, not as
  part of the live server, and only needs to be re-run when seed data changes.

## Core Database Tables (Supabase/Postgres)

| Table | Key fields |
| --- | --- |
| `companies` | id, name, industry |
| `roles` | id, company_id, title, experience_level |
| `topics` | id, name, category |
| `role_topic_weightage` | role_id, topic_id, weight, round_type, source_count |
| `interview_experiences` | id, company_id, role_id, raw_text, source_url, date_posted |
| `users` | id (from Supabase Auth), email |
| `user_skill_ratings` | user_id, topic_id, self_rating, last_reviewed_at |
| `revision_plans` | user_id, role_id, generated_at, plan_json |
