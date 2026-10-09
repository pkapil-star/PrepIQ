const express = require('express')
const supabase = require('../lib/supabaseClient')

const router = express.Router()

// GET /job-titles
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('job_titles').select('*').order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /job-titles/:id/topics?bucket= — topics for the self-assessment form, beginner first
router.get('/:id/topics', async (req, res, next) => {
  try {
    const { bucket } = req.query
    if (!bucket) return res.status(400).json({ error: 'bucket query param is required' })

    const { data, error } = await supabase
      .from('baseline_weights')
      .select('weight, topics(id, name, subject, level, est_hours)')
      .eq('job_title_id', req.params.id)
      .eq('experience_bucket', bucket)
      .gt('weight', 0)
    if (error) throw error

    const order = { beginner: 0, intermediate: 1, advanced: 2 }
    const topics = data
      .map((row) => ({ ...row.topics, weight: row.weight }))
      .sort((a, b) => a.subject.localeCompare(b.subject) || order[a.level] - order[b.level])
    res.json(topics)
  } catch (err) {
    next(err)
  }
})

module.exports = router
