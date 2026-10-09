# TRD.md — PrepIQ Technical Requirements

*Companion to PRD.md (what) and ARCHITECTURE.md (how it's built). This file states the
technical requirements that must hold; ARCHITECTURE.md has the stack, folder layout, and tables.
Rewritten 2026-10-05 for the job-title-first flow.*

## Scope

Hackathon MVP only. Scope is defined in PRD.md "Core Features" and "Out of Scope". Anything not
in PRD.md's MVP list is not a technical requirement here.

## Functional Requirements

| ID | Requirement | Source |
| --- | --- | --- |
| FR-1 | User logs in with Supabase Auth. | PRD: auth |
| FR-2 | User saves a profile: experience bucket (3 student, 3 working), job title (8 tracks), optional company, weeks until interview, hours per day. | PRD: profile |
| FR-3 | System returns the self-assessment topic list for the chosen job title + bucket. User rates each topic via MCQ options mapped to 0-1. | PRD: self-assessment |
| FR-4 | System builds a week-by-week roadmap, beginner to advanced, sized to weeks x hours/day, ranked by `P_t = w_t * (1 - s_t)`. | PRD: roadmap generator |
| FR-5 | If a company is chosen and interview data exists for it, topic weights blend baseline and company data. | PRD: topic weights |
| FR-6 | User downloads the roadmap as PDF and DOCX. | PRD: download |
| FR-7 | User ticks topics done; a topic done more than 30 days ago returns to the roadmap as revision. | PRD: progress tracker |
| FR-8 | Offline pipeline turns curated interview posts into per-company topic weights, loaded into the database. | PRD: offline pipeline |

## Non-Functional Requirements

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-1 | Roadmap generation reads only stored tables. It never calls an LLM on the request path. | Keeps demo latency low and independent of API availability |
| NFR-2 | Roadmap endpoint responds quickly for one user. | Well under 1 s on seeded data |
| NFR-3 | LLM extraction runs offline. A bad record is logged and skipped; it does not fail the batch. | RULES.md: error handling |
| NFR-4 | Secrets (Supabase service key) stay server-side. The browser talks to Supabase only for Auth (anon key); all data reads and writes go through the backend. | ARCHITECTURE.md: component connections |
| NFR-5 | Every API error returns `{ "error": "<message>" }`. | RULES.md: error handling |
| NFR-6 | Input is validated at the route boundary before business logic runs. | RULES.md |
| NFR-7 | Frontend shows a friendly message on API failure. No raw stack traces, no frozen screen. | RULES.md |
| NFR-8 | Layout is usable on a phone-width viewport (responsive web, no native app). | PRD: out of scope (native) |
| NFR-9 | Deployed to free-tier hosts: frontend on Vercel or Netlify, backend on Render or Railway. | ARCHITECTURE.md: hosting |
| NFR-10 | `/me/*` routes require a valid Supabase JWT (`Authorization: Bearer <token>`); a user only reads and writes their own rows. | FR-1 |

## API Contract (MVP)

| Method | Path | Auth | Purpose | Reads/writes |
| --- | --- | --- | --- | --- |
| GET | `/job-titles` | – | List the 8 job title tracks | `job_titles` |
| GET | `/companies` | – | List companies for the optional company step | `companies` |
| GET | `/job-titles/:id/topics?bucket=` | – | Topics for the self-assessment form | `baseline_weights`, `topics` |
| GET | `/me/profile` | JWT | Saved profile | `user_profiles` |
| PUT | `/me/profile` | JWT | Save profile (FR-2) | `user_profiles` |
| PUT | `/me/skills` | JWT | Save self-assessment, body `{ ratings: [{ topic_id, self_rating }] }` | `user_topics` |
| POST | `/me/roadmap` | JWT | Build, store, and return a roadmap (FR-4, FR-5) | all of the above, `company_topic_weights`, `roadmaps` |
| GET | `/me/roadmap` | JWT | Latest stored roadmap | `roadmaps` |
| POST | `/me/topics/:topicId/complete` | JWT | Tick a topic done (FR-7) | `user_topics` |
| DELETE | `/me/topics/:topicId/complete` | JWT | Untick | `user_topics` |

Roadmap response (`roadmap_json`): `{ budget_hours, weeks: [{ week, hours, topics: [{ topic_id,
name, subject, level, hours, priority, weight, self_rating, revision }] }], skipped: [...] }`.

## Data Requirements

- Tables and key fields: ARCHITECTURE.md "Core Database Tables"; DDL in `backend/sql/schema.sql`.
- Experience buckets: `student_new`, `student_interviewed`, `student_intern`, `work_1_2`,
  `work_2_4`, `work_4plus`.
- Job title slugs: `sde`, `fde`, `cloud`, `cyber`, `web`, `data-ml`, `devops`, `qa`.
- Curated topics + baseline weights live in `data-pipeline/seed/baseline.json`, loaded by
  `seed-baseline.js`.
- `interview_experiences` keeps raw text and `source_url` so company weights can be traced back
  to their source (PRD success criterion: judges can see the pipeline).

## Algorithm Requirements

Implemented in `backend/src/lib/roadmap.js`.

- `w_t` in [0, 1]: `baseline_weights.weight`; if company data exists,
  `w_t = 0.5 * baseline + 0.5 * company`.
- `s_t` in [0, 1]: `user_topics.self_rating` from the self-assessment form.
- Priority `P_t = w_t * (1 - s_t)`; ties broken by topic name.
- Hours per topic = `est_hours * (1 - s_t)`, rounded to 0.5 h, minimum 0.5 h.
- Budget = `weeks * 7 * hours_per_day`. Highest-priority topics are kept until the budget is
  full; the rest are returned as `skipped`.
- Kept topics are ordered beginner -> intermediate -> advanced, then by priority, and packed into
  weeks of `7 * hours_per_day` hours. A topic is not split across weeks.
- Topics with `completed_at` are left out unless done more than 30 days ago, in which case they
  return marked `revision: true`.
- The formula and its inputs must be visible in the app or the demo, not only in code.

## Constraints

- Stack is fixed by ARCHITECTURE.md: React + Vite + Tailwind, Node + Express, Supabase.
  Any new library needs a reason (CLAUDE.md, "Keep dependencies minimal").
- Folder structure is fixed by ARCHITECTURE.md.
- Hackathon time: 36-hour build window. Requirements that cannot be met in time are cut per
  TASK.md "If a Gate Check Fails", not silently dropped. For a solo build, cut auth first
  (demo user), then company blending.

## Locked Decisions

- Auth: **Supabase Auth** (email and/or Google). The browser uses the Supabase anon key for login
  only; the backend verifies the JWT (`backend/src/lib/auth.js`).
- Extraction runs **in a Claude Code session** (no Anthropic API key, no per-call cost): Claude
  reads `data-pipeline/seed/*.txt` and writes `data-pipeline/structured/<company>__<title>.json`;
  `load-to-db.js` loads it. `extract.js` stays as the scripted path if an API key is added later.
- Interview text: **manually curated** real posts (GfG, LeetCode Discuss, AmbitionBox).
- Skill check: **self-assessment form only**. Graded quiz dropped.
- Roadmap: **template + data, no live LLM**. Download as PDF and DOCX.
- Revision window: **30 days** after a topic is ticked done.
- Company blend: **50/50** baseline and company weight.
- Subjects: DSA, OS, DBMS, CN, OOP, role-specific. System Design and Behavioral are not covered.
