---
type: community
cohesion: 0.14
members: 17
---

# Tech Stack Decisions

**Cohesion:** 0.14 - loosely connected
**Members:** 17 nodes

## Members
- [[AILLM Claude API (default) or OpenAI API]] - document - ARCHITECTURE.md
- [[Backend Hosting Render or Railway]] - document - ARCHITECTURE.md
- [[Backend Node.js + Express]] - document - ARCHITECTURE.md
- [[Confirmed Decisions (stack, LLM, decay)]] - document - MEMORY.md
- [[Data Curation NodePython scripts + JSONCSV seed]] - document - ARCHITECTURE.md
- [[DatabaseAuth Supabase (Postgres)]] - document - ARCHITECTURE.md
- [[Frontend index.html Entry Point]] - code - frontend/index.html
- [[Frontend React + Vite + Tailwind CSS]] - document - ARCHITECTURE.md
- [[Live Request Path + Offline Pipeline Data Flow]] - document - ARCHITECTURE.md
- [[Open Decisions  Blockers]] - document - MEMORY.md
- [[PrepIQ Tech Stack Table]] - document - ARCHITECTURE.md
- [[React + Vite Template Scaffold]] - document - frontend/README.md
- [[React Compiler Note (not enabled)]] - document - frontend/README.md
- [[Supabase Project Live & Schema Run]] - document - MEMORY.md
- [[System Architecture Diagram]] - image - PrepIQ - PRD and TRD.pdf
- [[TRD Locked Decisions (Claude API, linear 30-day decay)]] - document - TRD.md
- [[Tech Stack Table (PDF)]] - document - PrepIQ - PRD and TRD.pdf

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Tech_Stack_Decisions
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Architecture & Project State Docs]]
- 1 edge to [[_COMMUNITY_Dev Conventions & Scope Rules]]
- 1 edge to [[_COMMUNITY_Product Requirements (PRD)]]

## Top bridge nodes
- [[PrepIQ Tech Stack Table]] - degree 10, connects to 1 community
- [[Live Request Path + Offline Pipeline Data Flow]] - degree 4, connects to 1 community
- [[System Architecture Diagram]] - degree 3, connects to 1 community
- [[Supabase Project Live & Schema Run]] - degree 2, connects to 1 community