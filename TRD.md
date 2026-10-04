# TRD.md — PrepIQ Technical Requirements

*Companion to PRD.md (what) and ARCHITECTURE.md (how it's built). This file states the
technical requirements that must hold; ARCHITECTURE.md has the stack, folder layout, and tables.*

## Scope

Hackathon MVP only. Scope is defined in PRD.md "Core Features" and "Out of Scope". Anything not
in PRD.md's MVP list is not a technical requirement here.

## Functional Requirements

| ID | Requirement | Source |
| --- | --- | --- |
| FR-1 | User selects company, role, and experience level from a seeded list (~15-20 companies, 2-3 roles each, fresher and experienced tracks). | PRD: selector |
| FR-2 | System returns the topic-weightage profile for the selected role. | PRD: topic-weightage view |
| FR-3 | User records a self-rating (or quiz result) per topic. | PRD: skill self-check |
| FR-4 | System returns a ranked revision list sorted by priority `P_t = w_t * (1 - s_t)`, descending. | ARCHITECTURE: core algorithm |
| FR-5 | User marks a topic reviewed; `last_reviewed_at` updates and the topic's effective skill decays linearly with time since that date. | PRD: revision tracker |
| FR-6 | Offline pipeline turns curated interview text into structured topic and weightage records, loaded into the database. | PRD: offline pipeline |

## Non-Functional Requirements

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-1 | Ranked-plan endpoint reads only stored tables. It never calls an LLM on the request path. | Keeps demo latency low and independent of API availability |
| NFR-2 | Plan endpoint responds quickly for one user and one role. | Well under 1 s on seeded data (~20 companies) |
| NFR-3 | LLM extraction runs offline. A bad LLM record is logged and skipped; it does not fail the batch. | RULES.md: error handling |
| NFR-4 | Secrets (Supabase service key, `ANTHROPIC_API_KEY`) stay server-side. The browser never talks to Supabase or the LLM directly. | ARCHITECTURE.md: component connections |
| NFR-5 | Every API error returns `{ "error": "<message>" }`. | RULES.md: error handling |
| NFR-6 | Input is validated at the route boundary before business logic runs. | RULES.md |
| NFR-7 | Frontend shows a friendly message on API failure. No raw stack traces, no frozen screen. | RULES.md |
| NFR-8 | Layout is usable on a phone-width viewport (responsive web, no native app). | PRD: out of scope (native) |
| NFR-9 | Deployed to free-tier hosts: frontend on Vercel or Netlify, backend on Render or Railway. | ARCHITECTURE.md: hosting |

## API Contract (MVP)

| Method | Path | Purpose | Reads/writes |
| --- | --- | --- | --- |
| GET | `/companies` | List seeded companies | `companies` |
| GET | `/companies/:id/roles` | Roles for a company (with experience level) | `roles` |
| GET | `/roles/:id/weightage` | Topic weightage profile | `role_topic_weightage`, `topics` |
| POST | `/users/:id/skills` | Save self-ratings | `user_skill_ratings` |
| GET | `/users/:id/plan?role_id=` | Ranked revision list (FR-4) | `role_topic_weightage`, `user_skill_ratings` |
| POST | `/users/:id/topics/:topicId/review` | Mark topic reviewed (FR-5) | `user_skill_ratings` |

Endpoint shapes are the frontend/backend contract. Agree them in Phase 0 (TASK.md) before building.

## Data Requirements

- Tables and key fields: ARCHITECTURE.md "Core Database Tables".
- `users.id` comes from Supabase Auth.
- `interview_experiences` keeps raw text and `source_url` so every weightage value can be traced
  back to its source (PRD success criterion: judges can see the pipeline).

## Algorithm Requirements

- `w_t` in [0, 1]: from `role_topic_weightage.weight`.
- `s_t` in [0, 1]: from `user_skill_ratings.self_rating`, decayed linearly since
  `last_reviewed_at`. The exact decay rate is a team decision; record it in MEMORY.md once chosen.
- Ties broken by topic name so the output order is stable across runs.
- The formula and its inputs must be visible in the app or the demo, not only in code (PRD success
  criterion).

## Constraints

- Stack is fixed by ARCHITECTURE.md: React + Vite + Tailwind, Node + Express, Supabase, Claude API.
  Any new library needs a reason (CLAUDE.md, "Keep dependencies minimal").
- Folder structure is fixed by ARCHITECTURE.md.
- Hackathon time: 36-hour build window. Requirements that cannot be met in time are cut per
  TASK.md "If a Gate Check Fails", not silently dropped.

## Locked Decisions

- LLM provider: **Claude API** (`claude-sonnet-5`, via `@anthropic-ai/sdk`).
- Decay: **linear, 30-day window** — `s_t` decays to 0 at 30 days since `last_reviewed_at`.
  Implemented in `backend/src/lib/scoring.js`.
- Quiz-derived `s_t` vs self-rating only. MVP default: self-rating only.
