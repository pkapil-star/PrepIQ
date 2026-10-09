// Pushes structured/*.json (extracted from interview posts) into company_topic_weights.
// Filename convention: <company-slug>__<job-title-slug>.json, e.g. amazon__sde.json
// JSON shape: { "topics": [{ "name": string, "weight": 0-1 }], "source_count": number }
// Topic names must match topics already loaded by seed-baseline.js; unknown names are logged and skipped.
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const STRUCTURED_DIR = path.join(__dirname, 'structured')

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function lookups() {
  const [companies, titles, topics] = await Promise.all([
    supabase.from('companies').select('id, name'),
    supabase.from('job_titles').select('id, slug'),
    supabase.from('topics').select('id, name'),
  ])
  for (const r of [companies, titles, topics]) if (r.error) throw r.error
  return {
    companyIds: Object.fromEntries(companies.data.map((c) => [slugify(c.name), c.id])),
    titleIds: Object.fromEntries(titles.data.map((j) => [j.slug, j.id])),
    topicIds: Object.fromEntries(topics.data.map((t) => [t.name, t.id])),
  }
}

async function loadOne(file, { companyIds, titleIds, topicIds }) {
  const [companySlug, titleSlug] = file.replace('.json', '').split('__')
  const companyId = companyIds[companySlug]
  const titleId = titleIds[titleSlug]
  if (!companyId || !titleId) throw new Error(`no company "${companySlug}" or job title "${titleSlug}"`)

  const { topics, source_count = 1 } = JSON.parse(fs.readFileSync(path.join(STRUCTURED_DIR, file), 'utf-8'))
  const rows = []
  for (const t of topics) {
    if (!topicIds[t.name]) {
      console.warn(`  ${file}: unknown topic "${t.name}" skipped`)
      continue
    }
    rows.push({ company_id: companyId, job_title_id: titleId, topic_id: topicIds[t.name], weight: t.weight, source_count })
  }
  const { error } = await supabase.from('company_topic_weights').upsert(rows)
  if (error) throw error
  console.log(`loaded ${file}: ${rows.length} topic weights`)
}

async function run() {
  const ids = await lookups()
  const files = fs.readdirSync(STRUCTURED_DIR).filter((f) => f.endsWith('.json'))
  for (const file of files) {
    try {
      await loadOne(file, ids)
    } catch (err) {
      console.error(`skipped ${file}: ${err.message}`)
    }
  }
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
