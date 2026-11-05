# TASK.md — Phased Task Breakdown

Team size: 3-4 people. Timeline: ~2 days of prep before the hackathon, then a 36-hour build
window. Tracks below are labeled A/B/C/D — with 3 people, fold D into A or C (polish/demo prep
doesn't need a dedicated person until near the end).

- **Track A — Backend + Algorithm**
- **Track B — Frontend + UI**
- **Track C — Data Pipeline + LLM Extraction**
- **Track D — Integration + Polish + Demo** (fold into A/B/C if only 3 people)

---

## How to use this file

From now on, new tasks are written here under "Current Task". The Phase 0-4 plan further down is the
old team plan and is kept for reference only.

**After finishing a feature, ask the user whether to log it in `MEMORY.md`. Don't update it until they say yes.**

## Current Task — Ranking step ("Let's do it")

Added 2026-11-05. Replaces the topic-rating page (`SelfAssessment.jsx`) right after the Profile page.
Landing, Login, auth and Profile stay as they are.

- [ ] Intro screen: "Rank your areas from weakest to strongest" + a "Let's do it" button
- [ ] Ranking board: 7 cards (DSA, OS, DBMS, CNS, OOP, Communication Skills, one role-specific card
      that changes with the target role); the user clicks them weakest first (rank 1) to strongest (rank 7)
- [ ] 3D cards that tilt toward the cursor, with a cursor-following spotlight and a rank badge
- [ ] Convert rank to a rating, `(rank - 1) / 6`, then reuse `saveSkills` + `generateRoadmap`
- [ ] Wire it into `App.jsx` (after Profile, and for "Redo assessment"), then delete `SelfAssessment.jsx`
- [ ] Known gap: Communication Skills has no topics yet, so it only affects ranking, not the roadmap

---

## Phase 0 — Pre-Hackathon Prep (the 2 days before)

Goal: walk into the hackathon with a working skeleton and real seed data, not a blank repo.

- [x] Finalize the ~15-20 seed companies + roles list (fresher + experienced tracks) — whole team
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
