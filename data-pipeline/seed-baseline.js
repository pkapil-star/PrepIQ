// Pushes seed/baseline.json (curated topics + baseline weights) into Supabase.
// Safe to re-run — topics upsert by name, weights upsert by (job title, bucket, topic).
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { topics, weights } = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed/baseline.json'), 'utf-8'))

async function run() {
  const { data: topicRows, error: tErr } = await supabase
    .from('topics')
    .upsert(topics, { onConflict: 'name' })
    .select('id, name')
  if (tErr) throw tErr
  const topicIds = Object.fromEntries(topicRows.map((t) => [t.name, t.id]))

  const { data: titles, error: jErr } = await supabase.from('job_titles').select('id, slug')
  if (jErr) throw jErr
  const titleIds = Object.fromEntries(titles.map((j) => [j.slug, j.id]))

  const rows = []
  for (const [slug, buckets] of Object.entries(weights)) {
    if (!titleIds[slug]) throw new Error(`unknown job title slug: ${slug}`)
    for (const [bucket, topicWeights] of Object.entries(buckets)) {
      for (const [name, weight] of Object.entries(topicWeights)) {
        if (!topicIds[name]) throw new Error(`weight for unknown topic "${name}" (add it to topics)`)
        rows.push({ job_title_id: titleIds[slug], experience_bucket: bucket, topic_id: topicIds[name], weight })
      }
    }
  }

  const { error: wErr } = await supabase.from('baseline_weights').upsert(rows)
  if (wErr) throw wErr
  console.log(`loaded ${topicRows.length} topics, ${rows.length} baseline weights`)
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
