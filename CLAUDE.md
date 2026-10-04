# CLAUDE.md — Code Conventions for PrepIQ

> Read this before writing or editing any code in this repo. If a change you're about to make
> conflicts with a rule here, stop and flag it instead of silently doing something else.

## The one rule that matters most

**Write the simplest code that correctly meets the actual requirement in PRD.md — nothing more.**
This is a 36-hour hackathon build with a 3-4 person team. Every hour spent on an abstraction,
pattern, or "future-proofing" that the PRD doesn't ask for is an hour not spent on a working demo.

A working, slightly rough feature beats a beautifully architected, unfinished one.

## Before writing code

1. Check `PRD.md` — is this feature actually in scope for the MVP? If it's in "Out of Scope," don't build it.
2. Check `ARCHITECTURE.md` — does this fit the existing tech stack, folder structure, and data flow? Don't introduce a new library, pattern, or service without a real reason.
3. Check `TASK.md` — is this the task you're actually on right now? Don't drift into someone else's track.

## Code style

- Prefer plain functions over classes unless there's real shared state to manage.
- No layers that don't earn their keep: don't add a repository/service/controller split for a single CRUD endpoint — a route handler that talks to the DB directly is fine for this project's size.
- No premature abstraction: don't build a generic "plugin system" for something used once. Duplicate a few lines before reaching for a clever shared helper.
- Keep functions short and readable. If a function needs a comment to explain what each block does, it probably wants to be two functions.
- Use `async`/`await` with `try/catch`, never nested callbacks or unhandled promise chains.
- One consistent error-handling path (see RULES.md) — don't invent a new error shape per route.
- Comments explain *why*, not *what* the code already says.
- Keep dependencies minimal. Before `npm install`-ing something new, ask: can this be done in 10-20 lines without a library?

## Naming & structure

- Follow the folder structure in `ARCHITECTURE.md` exactly — don't invent new top-level folders mid-build.
- Use clear, boring names (`getRevisionPlan`, not `fetchData2` or `doMagic`).
- Keep files scoped to one responsibility; split a file once it's doing clearly unrelated things, not before.

## When you're unsure

Default to the option that is:
1. Faster to build correctly in the time left
2. Easier for a teammate to read without explanation
3. Easiest to rip out and replace if it turns out wrong

If two options are close, pick the simpler one and move on — don't burn hackathon time deliberating.

## Keeping docs in sync

Whenever you make a meaningful change (new feature, changed approach, new dependency, scope cut),
update `MEMORY.md` immediately — that file is what lets the next session (human or Claude) pick up
without re-reading the whole codebase.
