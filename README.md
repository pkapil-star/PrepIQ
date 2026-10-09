# PrepIQ

**A personalized, week-by-week interview prep roadmap for the job you actually want.**

Built for *Build For Bharat 2.0 — Intelligent Talent and Workforce Ecosystem*.

Most interview prep is generic: the same 150 questions for everyone, whether you're a first-year
student or an engineer with four years of experience, and whether you're aiming for SDE or Cloud.
PrepIQ asks who you are, what role you want, and what you already know — then builds a roadmap
that covers DSA and core CS subjects in the right proportions for *you*, sized to the time you
have before your interview.

> **Status:** in active development (pre-hackathon). Backend and data model are in place; the
> frontend screens and the curated topic data are next. See [MEMORY.md](MEMORY.md) for the
> current state.

## How it works

1. **Log in** with Supabase Auth.
2. **Tell us where you are** — a student (first-timer, has interviewed before, or has done an
   internship) or working (1-2, 2-4, or 4+ years).
3. **Pick a job title** — SDE / Software Engineer, Forward Deployed Engineer, Cloud Engineer,
   Cybersecurity Engineer, Frontend / Backend / Full-stack, Data / ML Engineer, DevOps / SRE,
   or QA / SDET.
4. **Optionally pick a target company** — its real interview data shifts the topic weights.
5. **Set your time** — weeks until the interview and hours per day.
6. **Self-assess** — a short form asking how well you know each DSA topic and core subject.
7. **Get your roadmap** — beginner to advanced, week by week, ready to download as PDF or DOCX.
8. **Track progress** — tick topics off; anything you finished more than 30 days ago comes back
   for revision.

Subjects covered: **DSA** (syllabus + patterns), **OS**, **DBMS**, **CN**, **OOP**, and
**role-specific** topics (cloud, security, web, ML, DevOps, testing). DSA is in every roadmap,
but in a different proportion for each job title and experience level.

## The core idea

Every topic gets a priority:

```
P_t = w_t × (1 − s_t)
```

- `w_t` — how much the topic matters for your job title and experience level, from a curated
  baseline, blended 50/50 with company interview data when you pick a company
- `s_t` — how well you already know it, from your self-assessment (0 to 1)

The highest-priority topics are kept until your time budget is full, then laid out from beginner
to advanced and packed into weeks. Topics you already know get less time; topics you don't know
get more. The roadmap is generated from data and rules, not by a live LLM call, so it's fast,
free to run, and explainable.

Company weights come from an **offline pipeline**: real interview experiences (GeeksforGeeks,
LeetCode Discuss, AmbitionBox) are curated, turned into structured topic data with Claude, and
loaded into the database.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Data pipeline | Node scripts + Claude for extraction |
| Hosting (planned) | Vercel / Netlify (frontend), Render / Railway (backend) |

## Project structure

```
frontend/        React app; src/api/client.js wraps the backend API
backend/         Express API
  sql/schema.sql   database schema (run in the Supabase SQL editor)
  src/routes/      companies, jobTitles, me (profile, skills, roadmap, progress)
  src/lib/         roadmap.js (roadmap builder), auth.js (JWT check), supabaseClient.js
data-pipeline/   offline scripts
  seed/            baseline.json (topics + weights), companies, raw interview text
  seed-baseline.js, seed-companies-roles.js, extract.js, load-to-db.js
```

## Running locally

Requires Node.js 18+ and a Supabase project.

1. Run `backend/sql/schema.sql` in your Supabase project's SQL editor.
2. Copy each `.env.example` to `.env` in `backend/`, `data-pipeline/`, and `frontend/`, and fill
   in your Supabase URL and keys. Never commit `.env` files.
3. Load seed data:
   ```bash
   cd data-pipeline
   npm install
   node seed-companies-roles.js
   node seed-baseline.js
   ```
4. Start the backend (http://localhost:3001):
   ```bash
   cd backend
   npm install
   npm run dev
   ```
5. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/job-titles` | List job title tracks |
| GET | `/companies` | List companies |
| GET | `/job-titles/:id/topics?bucket=` | Topics for the self-assessment form |
| GET / PUT | `/me/profile` | Read / save your profile |
| PUT | `/me/skills` | Save self-assessment ratings |
| POST / GET | `/me/roadmap` | Generate / fetch your latest roadmap |
| POST / DELETE | `/me/topics/:id/complete` | Tick / untick a topic |

`/me/*` routes need a Supabase session token: `Authorization: Bearer <token>`.

## Docs

- [PRD.md](PRD.md) — product requirements and user flow
- [TRD.md](TRD.md) — technical requirements, API contract, algorithm
- [ARCHITECTURE.md](ARCHITECTURE.md) — stack, folder layout, data flow, tables
- [TASK.md](TASK.md) — build plan
- [RULES.md](RULES.md) — development rules
- [MEMORY.md](MEMORY.md) — current project state and change log

## Roadmap after the hackathon

- Paid roadmap downloads
- More companies with real interview data
- System Design and behavioral prep
