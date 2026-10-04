const express = require('express')
const supabase = require('../lib/supabaseClient')
const { rankTopics } = require('../lib/scoring')

const router = express.Router()

// POST /users/:id/skills — body: { ratings: [{ topic_id, self_rating }] }
router.post('/:id/skills', async (req, res, next) => {
  try {
    const { ratings } = req.body
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'ratings must be a non-empty array' })
    }
    const rows = ratings.map((r) => ({
      user_id: req.params.id,
      topic_id: r.topic_id,
      self_rating: r.self_rating,
    }))
    const { error } = await supabase.from('user_skill_ratings').upsert(rows)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// GET /users/:id/plan?role_id=
router.get('/:id/plan', async (req, res, next) => {
  try {
    const { role_id } = req.query
    if (!role_id) return res.status(400).json({ error: 'role_id query param is required' })

    const { data: weightage, error: wErr } = await supabase
      .from('role_topic_weightage')
      .select('weight, topics(id, name)')
      .eq('role_id', role_id)
    if (wErr) throw wErr

    const { data: ratings, error: rErr } = await supabase
      .from('user_skill_ratings')
      .select('topic_id, self_rating, last_reviewed_at')
      .eq('user_id', req.params.id)
    if (rErr) throw rErr

    const ratingsByTopic = Object.fromEntries(ratings.map((r) => [r.topic_id, r]))
    const merged = weightage.map((w) => ({
      topic_id: w.topics.id,
      name: w.topics.name,
      weight: w.weight,
      self_rating: ratingsByTopic[w.topics.id]?.self_rating,
      last_reviewed_at: ratingsByTopic[w.topics.id]?.last_reviewed_at,
    }))

    res.json(rankTopics(merged))
  } catch (err) {
    next(err)
  }
})

// POST /users/:id/topics/:topicId/review
router.post('/:id/topics/:topicId/review', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('user_skill_ratings')
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq('user_id', req.params.id)
      .eq('topic_id', req.params.topicId)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
