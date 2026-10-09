// One-time seed: pushes the companies in seed/companies-roles.json into Supabase.
// Safe to re-run — inserts a company only if its name doesn't exist yet. The title and
// experience_level fields are leftovers from the old company-first design and are ignored.
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed/companies-roles.json'), 'utf-8'))

async function run() {
  const seen = new Set()
  for (const row of rows) {
    if (seen.has(row.company)) continue
    seen.add(row.company)

    const { data: existing, error: findErr } = await supabase
      .from('companies')
      .select('id')
      .eq('name', row.company)
      .maybeSingle()
    if (findErr) throw findErr

    if (existing) {
      console.log(`skipped (exists): ${row.company}`)
      continue
    }
    const { error } = await supabase.from('companies').insert({ name: row.company, industry: row.industry })
    if (error) throw error
    console.log(`inserted: ${row.company}`)
  }
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
