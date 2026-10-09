# PRD.md — PrepIQ Product Requirements

*Build For Bharat 2.0 — Intelligent Talent and Workforce Ecosystem*

## Objective

PrepIQ gives a job seeker a personalized, week-by-week interview prep roadmap for the job title
they want. The roadmap covers DSA (syllabus + patterns) and core CS subjects, in proportions that
depend on the job title, the user's experience, and what they already know. An optional target
company refines the weights using real interview experiences.

This is not a static "company-wise interview questions" lookup table: topic weights are computed
from a curated baseline plus real interview data, and the roadmap changes as the user's
self-assessment changes.

## Target Audience

1. **Students** (primary persona) — campus placement prep. Split by background: first-timer,
   has done interviews before, has done an internship.
2. **Working professionals switching jobs** (secondary persona) — split by experience:
   1-2 years, 2-4 years, 4+ years.

Both personas use the same engine; the experience bucket changes what gets weighted and how
advanced the roadmap starts.

## User Flow

1. **Login** — Supabase Auth (email and/or Google).
2. **Profile** — Student or Working.
   - Student: first-timer / has interviewed before / has done an internship.
   - Working: 1-2 years / 2-4 years / 4+ years.
3. **Job title** — one of: SDE / Software Engineer, Forward Deployed Engineer, Cloud Engineer,
   Cybersecurity Engineer, Frontend / Backend / Full-stack, Data / ML Engineer, DevOps / SRE,
   QA / SDET.
4. **Target company (optional)** — refines topic weights using that company's interview data.
5. **Prep time** — weeks until interview + hours per day.
6. **Self-assessment form** — per subject and DSA topic, the user picks how well they know it
   from multiple-choice options. No graded quiz.
7. **Roadmap** — shown on screen: ordered beginner to advanced, laid out week by week, sized to
   the user's time budget. DSA is included for every job title, in a different proportion per
   title and experience.
8. **Download** — roadmap as PDF and DOCX. (Paid download is a later feature, not MVP.)
9. **Progress tracking** — user ticks topics done; topics done more than 30 days ago are flagged
   for revision.

## Goals

1. Give a user a personalized, week-by-week roadmap within seconds of finishing the form.
2. Replace generic "do these 150 questions" lists with weights tied to job title, experience,
   and (optionally) company.
3. Reduce the "I forgot what I studied" problem with progress tracking and revision flags.
4. Prove a real analytical/AI pipeline (LLM-based extraction from interview posts + priority
   scoring) — not just a dashboard — per the hackathon's requirement to go beyond visualization.

## Core Features (Hackathon MVP)

| Feature | Description |
| --- | --- |
| Auth | Supabase Auth login |
| Profile + job title selector | Student/working bucket, job title, optional company, prep time |
| Self-assessment form | MCQ-style "how well do you know X" per subject and DSA topic |
| Topic weights | Curated baseline per job title x experience, adjusted by real interview data where available |
| Roadmap generator | Template + data (no live LLM): priority = weight x (1 - skill), ordered beginner to advanced, packed into weeks by hours budget |
| Roadmap download | PDF and DOCX |
| Progress tracker | Tick topics done; 30-day revision flag |
| Offline data pipeline | LLM extraction of topic data from curated interview posts (run in a Claude Code session) |

**Subjects covered:** DSA (syllabus + patterns), OS, DBMS, CN, OOP, and role-specific topics
(cloud, security, web, ML, DevOps, testing).

## Out of Scope (for the hackathon)

- Paid roadmap download / payments (planned later)
- Live LLM-written roadmaps (template-based for MVP)
- Graded quizzes (self-assessment form instead)
- Live scraping of GeeksforGeeks/LeetCode Discuss/Glassdoor (use a curated static seed dataset)
- Full spaced-repetition scheduling (SM-2 style) — linear 30-day revision flag is enough
- Resume parsing / automatic skill detection
- Mock interview simulation
- Native mobile app (responsive web is enough)

## Success Criteria

- A live, working demo end-to-end: login -> profile -> job title -> self-assessment -> roadmap
  on screen -> download PDF/DOCX -> tick a topic done and see progress.
- All 8 job title tracks produce a sensible roadmap for every experience bucket.
- The roadmap visibly changes when self-assessment or job title changes (proves personalization).
- Picking a company visibly shifts topic weights where interview data exists.
- Judges can see the priority formula and the extraction pipeline, not just a pretty UI.

## Related Docs

- `TRD.md` — technical requirements
- `ARCHITECTURE.md` — tech stack, folder structure, data flow
- `RULES.md` — development rules and error handling
- `TASK.md` — phased task breakdown
- `MEMORY.md` — current project state, updated after every main change
