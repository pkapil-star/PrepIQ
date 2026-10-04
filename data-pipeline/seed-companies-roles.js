// One-time seed: pushes seed/companies-roles.json into Supabase companies + roles tables.
// Safe to re-run — upserts companies by name, inserts roles only if the exact
// (company_id, title, experience_level) combo doesn't already exist.
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed/companies-roles.json'), 'utf-8'))

async function run() {
  const companyIds = {}

  for (const row of rows) {
    if (!(row.company in companyIds)) {
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('name', row.company)
        .maybeSingle()

      if (existing) {
        companyIds[row.company] = existing.id
      } else {
        const { data: created, error } = await supabase
          .from('companies')
          .insert({ name: row.company, industry: row.industry })
          .select('id')
          .single()
        if (error) throw error
        companyIds[row.company] = created.id
      }
    }

    const companyId = companyIds[row.company]
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('company_id', companyId)
      .eq('title', row.title)
      .eq('experience_level', row.experience_level)
      .maybeSingle()

    if (!existingRole) {
      const { error } = await supabase
        .from('roles')
        .insert({ company_id: companyId, title: row.title, experience_level: row.experience_level })
      if (error) throw error
      console.log(`inserted: ${row.company} / ${row.title} / ${row.experience_level}`)
    } else {
      console.log(`skipped (exists): ${row.company} / ${row.title} / ${row.experience_level}`)
    }
  }
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
