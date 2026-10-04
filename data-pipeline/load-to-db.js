// Pushes structured/*.json (produced by extract.js) into Supabase.
// Filename convention: <company-slug>__<role-slug>__<experience_level>.json
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const STRUCTURED_DIR = path.join(__dirname, 'structured')

async function loadOne(file, companyId, roleId) {
  const { topics } = JSON.parse(fs.readFileSync(path.join(STRUCTURED_DIR, file), 'utf-8'))

  for (const topic of topics) {
    const { data: topicRow, error: topicErr } = await supabase
      .from('topics')
      .upsert({ name: topic.name, category: topic.category }, { onConflict: 'name' })
      .select()
      .single()
    if (topicErr) throw topicErr

    const { error: weightErr } = await supabase.from('role_topic_weightage').upsert({
      role_id: roleId,
      topic_id: topicRow.id,
      weight: topic.weight,
      round_type: topic.round_type,
    })
    if (weightErr) throw weightErr
  }
}

async function run() {
  const files = fs.readdirSync(STRUCTURED_DIR).filter((f) => f.endsWith('.json'))
  for (const file of files) {
    try {
      // TODO: resolve companyId/roleId from the filename convention once companies/roles are seeded
      console.log(`load-to-db: ${file} (wire up company/role lookup before running for real)`)
    } catch (err) {
      console.error(`skipped ${file}: ${err.message}`)
    }
  }
}

run()
