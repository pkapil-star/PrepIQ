// Reads curated interview-experience text from seed/, calls the LLM, writes structured
// topic/round records to structured/ (one JSON file per company, picked up by load-to-db.js).
// RULES.md: a record that doesn't parse is logged and skipped — never crashes the batch.
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SEED_DIR = path.join(__dirname, 'seed')
const OUT_DIR = path.join(__dirname, 'structured')

const EXTRACTION_PROMPT = `Extract structured interview topic data from the raw text below.
Return ONLY valid JSON matching this shape:
{"topics": [{"name": string, "category": string, "round_type": string, "weight": number}]}
"weight" is 0-1, your estimate of how central the topic is to this role's interview process.

Raw interview-experience text:
`

async function extractOne(rawText) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: EXTRACTION_PROMPT + rawText }],
  })
  const text = message.content[0].text
  return JSON.parse(text)
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith('.txt'))

  for (const file of files) {
    const rawText = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8')
    try {
      const structured = await extractOne(rawText)
      fs.writeFileSync(
        path.join(OUT_DIR, file.replace('.txt', '.json')),
        JSON.stringify(structured, null, 2)
      )
      console.log(`extracted: ${file}`)
    } catch (err) {
      console.error(`skipped ${file}: ${err.message}`)
    }
  }
}

run()
