---
type: community
cohesion: 0.08
members: 27
---

# Data Pipeline Extraction

**Cohesion:** 0.08 - loosely connected
**Members:** 27 nodes

## Members
- [[@anthropic-aisdk_1]] - concept - data-pipeline/package.json
- [[Anthropic]] - code - data-pipeline/extract.js
- [[OUT_DIR]] - code - data-pipeline/extract.js
- [[SEED_DIR]] - code - data-pipeline/extract.js
- [[STRUCTURED_DIR]] - code - data-pipeline/load-to-db.js
- [[TODO resolve companyIdroleId from the filename convention once…]] - rationale - data-pipeline/load-to-db.js
- [[extract.js]] - code - data-pipeline/extract.js
- [[extractOne()]] - code - data-pipeline/extract.js
- [[fs]] - code - data-pipeline/extract.js
- [[fs_1]] - code - data-pipeline/load-to-db.js
- [[fs_2]] - code - data-pipeline/seed-companies-roles.js
- [[load-to-db.js]] - code - data-pipeline/load-to-db.js
- [[loadOne()]] - code - data-pipeline/load-to-db.js
- [[path]] - code - data-pipeline/extract.js
- [[path_1]] - code - data-pipeline/load-to-db.js
- [[path_2]] - code - data-pipeline/seed-companies-roles.js
- [[ref_fs]] - concept
- [[ref_path]] - concept
- [[rows]] - code - data-pipeline/seed-companies-roles.js
- [[run()]] - code - data-pipeline/extract.js
- [[run()_1]] - code - data-pipeline/load-to-db.js
- [[run()_2]] - code - data-pipeline/seed-companies-roles.js
- [[seed-companies-roles.js]] - code - data-pipeline/seed-companies-roles.js
- [[supabase_4]] - code - data-pipeline/load-to-db.js
- [[supabase_5]] - code - data-pipeline/seed-companies-roles.js
- [[{ createClient }_1]] - code - data-pipeline/load-to-db.js
- [[{ createClient }_2]] - code - data-pipeline/seed-companies-roles.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Data_Pipeline_Extraction
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_Backend API & Scoring Logic]]
- 1 edge to [[_COMMUNITY_Data Pipeline Dependencies]]

## Top bridge nodes
- [[load-to-db.js]] - degree 11, connects to 1 community
- [[seed-companies-roles.js]] - degree 9, connects to 1 community
- [[@anthropic-aisdk_1]] - degree 2, connects to 1 community