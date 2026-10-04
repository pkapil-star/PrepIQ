# Graph Report - PrepIQ  (2026-10-04)

## Corpus Check
- Corpus is ~9,324 words - fits in a single context window. You may not need a graph.

## Summary
- 236 nodes · 275 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend Dependencies
- Backend API & Scoring Logic
- Data Pipeline Extraction
- Architecture & Project State Docs
- Backend Dependencies
- Data Pipeline Dependencies
- Product Requirements (PRD)
- Tech Stack Decisions
- Dev Conventions & Scope Rules
- Frontend API Client
- UI Icon Assets
- Linter Config
- Favicon Asset
- Vite Demo Hero Image
- React Logo Asset
- Vite Logo Asset

## God Nodes (most connected - your core abstractions)
1. `PrepIQ Tech Stack Table` - 10 edges
2. `Core Algorithm: P_t = w_t * (1 - s_t)` - 9 edges
3. `Core Database Tables (Supabase/Postgres)` - 9 edges
4. `request()` - 7 edges
5. `Monorepo Folder Structure` - 6 edges
6. `Icons Sprite Sheet (icons.svg)` - 6 edges
7. `express` - 5 edges
8. `scripts` - 5 edges
9. `Core Features (Hackathon MVP) Table` - 5 edges
10. `Gap-Priority Scoring Algorithm (PDF)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `PrepIQ Tech Stack Table` --semantically_similar_to--> `Tech Stack Table (PDF)`  [INFERRED] [semantically similar]
  ARCHITECTURE.md → PrepIQ - PRD and TRD.pdf
- `Core Algorithm: P_t = w_t * (1 - s_t)` --semantically_similar_to--> `Gap-Priority Scoring Algorithm (PDF)`  [INFERRED] [semantically similar]
  ARCHITECTURE.md → PrepIQ - PRD and TRD.pdf
- `Core Database Tables (Supabase/Postgres)` --semantically_similar_to--> `Core Data Models Table (PDF)`  [INFERRED] [semantically similar]
  ARCHITECTURE.md → PrepIQ - PRD and TRD.pdf
- `Tracks A/B/C/D Definition` --semantically_similar_to--> `Hackathon Build Plan (4 Phases, 3 Gates)`  [INFERRED] [semantically similar]
  TASK.md → PrepIQ - PRD and TRD.pdf
- `TRD Non-Functional Requirements (NFR-1..NFR-9)` --semantically_similar_to--> `Non-Functional Requirements Table (PDF)`  [INFERRED] [semantically similar]
  TRD.md → PrepIQ - PRD and TRD.pdf

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "Frontend Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, react, react-dom, @tailwindcss/vite, devDependencies, autoprefixer, oxlint, postcss (+26 more)

### Community 1 - "Backend API & Scoring Logic"
Cohesion: 0.09
Nodes (22): decayedSkill(), rankTopics(), { createClient }, supabase, express, router, supabase, express (+14 more)

### Community 2 - "Data Pipeline Extraction"
Cohesion: 0.08
Nodes (18): Anthropic, extractOne(), fs, OUT_DIR, path, run(), SEED_DIR, { createClient } (+10 more)

### Community 3 - "Architecture & Project State Docs"
Cohesion: 0.10
Nodes (26): Component Connections (frontend/backend/lib layering), Core Algorithm: P_t = w_t * (1 - s_t), Core Database Tables (Supabase/Postgres), Frontend Hosting: Vercel or Netlify, Keeping Docs in Sync Rule, The One Rule: Simplest Correct Code per PRD, When You're Unsure Defaults, MEMORY.md Change Log (+18 more)

### Community 4 - "Backend Dependencies"
Cohesion: 0.09
Nodes (22): author, dependencies, cors, dotenv, express, @supabase/supabase-js, description, devDependencies (+14 more)

### Community 5 - "Data Pipeline Dependencies"
Cohesion: 0.11
Nodes (18): author, dependencies, @anthropic-ai/sdk, dotenv, @supabase/supabase-js, description, dotenv, @supabase/supabase-js (+10 more)

### Community 6 - "Product Requirements (PRD)"
Cohesion: 0.14
Nodes (19): PRD Goals, PrepIQ Objective, PRD Success Criteria, Target Audience (students, professionals), Core Data Models Table (PDF), Hackathon Build Plan (4 Phases, 3 Gates), Curation Approach for the Hackathon, Candidate Public Data Sources (+11 more)

### Community 7 - "Tech Stack Decisions"
Cohesion: 0.14
Nodes (17): Backend: Node.js + Express, Data Curation: Node/Python scripts + JSON/CSV seed, Live Request Path + Offline Pipeline Data Flow, Frontend: React + Vite + Tailwind CSS, Backend Hosting: Render or Railway, AI/LLM: Claude API (default) or OpenAI API, Database/Auth: Supabase (Postgres), PrepIQ Tech Stack Table (+9 more)

### Community 8 - "Dev Conventions & Scope Rules"
Cohesion: 0.20
Nodes (12): Monorepo Folder Structure, Code Style Conventions, Naming & Structure Conventions, Before Writing Code Checklist, Out of Scope (Hackathon), Out-of-Scope / Future Roadmap (PDF), Lightweight Code Review Practice, General Principles (demo beats perfect code) (+4 more)

### Community 9 - "Frontend API Client"
Cohesion: 0.46
Nodes (7): getCompanies(), getPlan(), getRoles(), getWeightage(), markReviewed(), request(), saveSkills()

### Community 10 - "UI Icon Assets"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social (Generic) Icon, Icons Sprite Sheet (icons.svg), X (Twitter) Icon

### Community 11 - "Linter Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Ambiguous Edges - Review These
- `Phase 4 â€” Hours 30-36: Demo Prep + Deploy` → `PDF Executive Summary`  [AMBIGUOUS]
  TASK.md · relation: references

## Knowledge Gaps
- **131 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Phase 4 â€” Hours 30-36: Demo Prep + Deploy` and `PDF Executive Summary`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `express` connect `Backend API & Scoring Logic` to `Backend Dependencies`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `@anthropic-ai/sdk` connect `Data Pipeline Extraction` to `Data Pipeline Dependencies`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Core Database Tables (Supabase/Postgres)` connect `Architecture & Project State Docs` to `Product Requirements (PRD)`, `Tech Stack Decisions`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Core Algorithm: P_t = w_t * (1 - s_t)` (e.g. with `Gap-Priority Scoring Algorithm (PDF)` and `Phase 1 â€” Hours 0-8: Foundations`) actually correct?**
  _`Core Algorithm: P_t = w_t * (1 - s_t)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Core Database Tables (Supabase/Postgres)` (e.g. with `Core Data Models Table (PDF)` and `Core Features (Hackathon MVP) Table`) actually correct?**
  _`Core Database Tables (Supabase/Postgres)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._