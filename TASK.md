# TASK.md — Phased Task Breakdown

Team size: 3-4 people. Timeline: ~2 days of prep before the hackathon, then a 36-hour build
window. Tracks below are labeled A/B/C/D — with 3 people, fold D into A or C (polish/demo prep
doesn't need a dedicated person until near the end).

- **Track A — Backend + Algorithm**
- **Track B — Frontend + UI**
- **Track C — Data Pipeline + LLM Extraction**
- **Track D — Integration + Polish + Demo** (fold into A/B/C if only 3 people)

---

## Phase 0 — Pre-Hackathon Prep (the 2 days before)

Goal: walk into the hackathon with a working skeleton and real seed data, not a blank repo.

- [ ] Finalize the ~15-20 seed companies + roles list (fresher + experienced tracks) — whole team
- [ ] Collect/curate raw interview-experience text for those companies (GeeksforGeeks, LeetCode
      Discuss, AmbitionBox, personal/peer notes) — Track C
- [ ] Create the Supabase project; set up the core tables from ARCHITECTURE.md — Track A
- [ ] Scaffold `frontend/` (Vite + Tailwind) and `backend/` (Express) per the folder structure in
      ARCHITECTURE.md — Track A + Track B
- [ ] Write and test `data-pipeline/extract.js` against 2-3 sample companies end-to-end (raw text
      -> LLM -> structured output) — Track C
- [ ] Confirm the API contract between frontend and backend (endpoint shapes from
      ARCHITECTURE.md) so both tracks can build in parallel without blocking each other — whole team
- [ ] Assign final track ownership among the 3-4 teammates — whole team

## Phase 1 — Hours 0-8: Foundations

- [ ] Track C: run the extraction pipeline across all seeded companies; load structured data into Supabase
- [ ] Track A: implement `GET /companies`, `GET /companies/:id/roles`, `GET /roles/:id/weightage`
- [ ] Track B: build the company/role/experience selector UI and basic routing/page shell
- [ ] Gate check: can the frontend at least display a hardcoded or real weightage profile for one company?

## Phase 2 — Hours 8-20: Core Feature Build

- [ ] Track A: implement the skill self-check endpoint (`POST /users/:id/skills`) and the
      gap-priority scoring logic (`GET /users/:id/plan?role_id=`)
- [ ] Track B: build the topic-weightage view and the ranked revision plan UI
- [ ] Track C: validate extracted weightage against source text for a handful of roles; fix
      extraction prompt issues found
- [ ] Track A/B together: wire the skill self-check UI to the backend and confirm the ranked plan
      changes when self-ratings change
- [ ] Gate check: full flow works — pick company/role/experience -> see weightage -> rate skills -> see a ranked plan

## Phase 3 — Hours 20-30: Revision Tracker + Integration + Polish

- [ ] Track A: implement `POST /users/:id/topics/:topicId/review` + the decay-adjusted "needs
      revision" calculation
- [ ] Track B: build the "mark as reviewed" UI and surfacing of decayed/forgotten topics
- [ ] Track D (or whoever's free): visual polish, loading/error states, mobile-responsive pass
- [ ] Whole team: integration pass — click through the entire app end-to-end, fix anything broken
- [ ] Gate check: end-to-end flow works with no step requiring a developer to intervene

## Phase 4 — Hours 30-36: Demo Prep + Deploy

- [ ] Deploy frontend (Vercel/Netlify) and backend (Render/Railway) — Track A/D
- [ ] Final bug sweep on the deployed version, not just localhost — whole team
- [ ] Rehearse the live demo at least twice, timed — whole team
- [ ] Finalize the pitch deck content (problem, approach, tech stack, impact — see the PrepIQ
      PRD.md / TRD.md for source material) — Track D / whoever isn't fixing bugs
- [ ] If something isn't done in time: cut it from the demo script, don't apologize for it on
      stage — show what works confidently

## If a Gate Check Fails

If a phase's gate check isn't met on time, cut scope from the *next* phase's "nice to have" items
first (see PRD.md's Out of Scope list for what's already deprioritized) — never skip a gate check
itself just to move on, since that's how a broken demo happens.
