# RULES.md — Development Rules & Principles

## General Principles

1. **Working demo beats perfect code.** This is a 36-hour hackathon with 3-4 people. A feature
   that works end-to-end, even if rough, beats a beautifully engineered half-feature.
2. **Scope lives in PRD.md.** If something isn't in the MVP feature list, don't build it — add it
   to a "later" note in MEMORY.md instead and move on.
3. **Stay in your lane, but don't block on someone else's.** Check TASK.md for your track. If
   you're blocked on another track's output, build against a mocked/stubbed version of it and
   wire up the real thing later — don't sit idle.
4. **Small, frequent commits.** Commit every time something works, not just at the end of a
   session. A broken main branch blocks the whole team.
5. **If you're stuck for more than ~30 minutes, ask.** Ping a teammate or ask Claude — don't burn
   hackathon hours debugging alone when someone else could unblock you in 2 minutes.

## Git Workflow

- Branch naming: `feature/<short-name>` or `fix/<short-name>` (e.g. `feature/gap-scoring`,
  `fix/plan-sort-order`).
- Commit messages: short, present tense, say what changed (`add gap-priority scoring endpoint`,
  not `fixed stuff`).
- Merge to `main` as soon as a feature works and doesn't break the demo path — don't let branches
  sit unmerged for long given the time budget.
- Never commit `.env` or any real API keys/secrets. Keep a `.env.example` with placeholder keys
  in each of `frontend/` and `backend/`.

## Error Handling

- **Never fail silently.** Every `catch` block either handles the error meaningfully or logs it
  with enough context to debug (what operation, what input) — never an empty catch.
- **Backend:** one shared Express error-handling middleware that catches thrown/rejected errors
  and returns a consistent JSON error shape: `{ "error": "<human-readable message>" }`. Route
  handlers should `throw` or call `next(err)`, not hand-roll their own error responses.
- **Frontend:** API call failures show the user a short, friendly message (e.g. "Couldn't load
  your plan — try again"), never a raw stack trace or a blank/frozen screen.
- **Input validation happens at the API boundary** (in the route handler, before calling into
  `lib/`), not scattered throughout business logic.
- **LLM extraction pipeline:** if the LLM returns something that doesn't parse into the expected
  structure, log the raw response and skip that record rather than crashing the whole batch job —
  one bad interview-experience record shouldn't block loading the rest.

## Code Review (lightweight, given the time budget)

- Before merging a non-trivial change, have at least one other teammate glance at the diff —
  doesn't need to be a formal review, just a sanity check.
- Favor a quick verbal walkthrough over a written review comment thread — faster during a
  hackathon.

## Keeping Things in Sync

- Any change to scope, approach, or a key decision gets logged in `MEMORY.md` immediately, not
  "at the end of the day" — someone else on the team (or a fresh Claude session) may need that
  context sooner than you think.
