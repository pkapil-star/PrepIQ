# PRD.md — PrepIQ Product Requirements

*Build For Bharat 2.0 — Intelligent Talent and Workforce Ecosystem*

## Objective

PrepIQ turns real, publicly available interview experiences into a personalized, prioritized
revision plan. Instead of generic prep content, it computes a data-backed topic-weightage profile
per company + role + experience level, compares it against the user's actual skill level, and
returns a ranked list of what to revise first — plus a decay-based reminder system so topics
learned a while ago don't quietly get forgotten before the interview.

This is not a static "company-wise interview questions" lookup table: the weightage and the
ranking are computed, not hand-written, and they change as the user's self-assessed skill changes.

## Target Audience

1. **Campus placement students** (primary persona) — fresher-level, DSA-heavy rounds (OA +
   technical + HR), need to know what to revise for a specific company/role before placement season.
2. **Working professionals switching jobs** (secondary persona) — 2+ years experience, targeting
   a lateral move to a new/larger company, need to refresh rusty fundamentals and prep for
   system-design/behavioral rounds, which fresher-focused prep content doesn't cover well.

Both personas get the same underlying engine; an `experience_level` field (fresher / 1-3 YOE /
4+ YOE) changes what gets weighted, not the product itself.

## Goals

1. Give a user a ranked, data-backed revision list for a specific company + role + experience
   level within seconds of choosing them.
2. Replace unstructured "read interview experience posts" with a structured, queryable
   topic-weightage model.
3. Reduce the "I forgot what I studied" problem with a lightweight revision tracker.
4. Prove a real analytical/AI pipeline (LLM-based extraction + gap-priority scoring) — not just a
   dashboard — per the hackathon's requirement to go beyond visualization.

## Core Features (Hackathon MVP)

| Feature | Description |
| --- | --- |
| Company + role + experience selector | Pick from a seeded list (~15-20 companies x 2-3 roles x fresher/experienced) |
| Topic-weightage view | Data-backed round structure + topic importance for that selection |
| Skill self-check | Quick quiz or self-rating per topic to establish current skill level |
| Personalized gap-priority list | Ranked revision list = topic importance x skill gap |
| Revision tracker (decay-based) | Marks topics "learned on [date]"; resurfaces them as they age |
| Offline data pipeline | LLM-based extraction of structured topic/round data from curated interview text |

## Out of Scope (for the hackathon)

- Live scraping of GeeksforGeeks/LeetCode Discuss/Glassdoor (use a curated static seed dataset instead)
- Full spaced-repetition scheduling (SM-2 style) — a simple linear decay heuristic is enough for MVP
- Resume parsing / automatic skill detection
- Mock interview simulation (good v2 idea, not required to prove the core thesis)
- Native mobile app (responsive web is enough)

## Success Criteria

- A live, working demo end-to-end: pick company/role/experience -> see weightage -> see a
  personalized ranked plan -> mark a topic reviewed and see it reflected.
- At least 15-20 companies have real seeded data, across fresher and experienced tracks.
- The ranked plan visibly changes when the user's self-rated skill changes (proves personalization,
  not a static table).
- Judges can see the gap-priority formula and the extraction pipeline, not just a pretty UI.

## Related Docs

- `ARCHITECTURE.md` — tech stack, folder structure, data flow
- `RULES.md` — development rules and error handling
- `TASK.md` — phased task breakdown for the team
- `MEMORY.md` — current project state, updated after every main change
