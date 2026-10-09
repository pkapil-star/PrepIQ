const express = require('express')
const supabase = require('../lib/supabaseClient')
const requireUser = require('../lib/auth')
const { blendWeight, buildRoadmap } = require('../lib/roadmap')

const router = express.Router()
router.use(requireUser)

const BUCKETS = ['student_new', 'student_interviewed', 'student_intern', 'work_1_2', 'work_2_4', 'work_4plus']

// GET /me/profile
router.get('/profile', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle()
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// PUT /me/profile — body: { experience_bucket, job_title_id, company_id?, weeks, hours_per_day }
router.put('/profile', async (req, res, next) => {
  try {
    const { experience_bucket, job_title_id, company_id, weeks, hours_per_day } = req.body
    if (!BUCKETS.includes(experience_bucket)) {
      return res.status(400).json({ error: `experience_bucket must be one of: ${BUCKETS.join(', ')}` })
    }
    if (!job_title_id) return res.status(400).json({ error: 'job_title_id is required' })
    if (!(weeks >= 1 && weeks <= 52)) return res.status(400).json({ error: 'weeks must be 1-52' })
    if (!(hours_per_day > 0 && hours_per_day <= 16)) {
      return res.status(400).json({ error: 'hours_per_day must be between 0 and 16' })
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: req.user.id,
        experience_bucket,
        job_title_id,
        company_id: company_id || null,
        weeks,
        hours_per_day,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// PUT /me/skills — body: { ratings: [{ topic_id, self_rating }] }, self_rating 0-1
router.put('/skills', async (req, res, next) => {
  try {
    const { ratings } = req.body
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'ratings must be a non-empty array' })
    }
    if (ratings.some((r) => !r.topic_id || !(r.self_rating >= 0 && r.self_rating <= 1))) {
      return res.status(400).json({ error: 'each rating needs topic_id and self_rating between 0 and 1' })
    }
    // Upsert only self_rating so completed_at progress is kept.
    const rows = ratings.map((r) => ({ user_id: req.user.id, topic_id: r.topic_id, self_rating: r.self_rating }))
    const { error } = await supabase.from('user_topics').upsert(rows)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// POST /me/roadmap — builds a roadmap from the saved profile + skills, stores and returns it
router.post('/roadmap', async (req, res, next) => {
  try {
    const { data: profile, error: pErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!profile) return res.status(400).json({ error: 'Fill in your profile first' })

    const { data: baseline, error: bErr } = await supabase
      .from('baseline_weights')
      .select('weight, topics(id, name, subject, level, est_hours)')
      .eq('job_title_id', profile.job_title_id)
      .eq('experience_bucket', profile.experience_bucket)
    if (bErr) throw bErr

    let companyWeights = {}
    if (profile.company_id) {
      const { data, error } = await supabase
        .from('company_topic_weights')
        .select('topic_id, weight')
        .eq('company_id', profile.company_id)
        .eq('job_title_id', profile.job_title_id)
      if (error) throw error
      companyWeights = Object.fromEntries(data.map((c) => [c.topic_id, c.weight]))
    }

    const { data: userTopics, error: uErr } = await supabase
      .from('user_topics')
      .select('topic_id, self_rating, completed_at')
      .eq('user_id', req.user.id)
    if (uErr) throw uErr
    const userByTopic = Object.fromEntries(userTopics.map((u) => [u.topic_id, u]))

    const topics = baseline.map((b) => ({
      topic_id: b.topics.id,
      name: b.topics.name,
      subject: b.topics.subject,
      level: b.topics.level,
      est_hours: Number(b.topics.est_hours),
      weight: blendWeight(Number(b.weight), companyWeights[b.topics.id]),
      self_rating: userByTopic[b.topics.id]?.self_rating ?? 0,
      completed_at: userByTopic[b.topics.id]?.completed_at ?? null,
    }))

    const roadmap = buildRoadmap(topics, { weeks: profile.weeks, hoursPerDay: Number(profile.hours_per_day) })

    const { data: saved, error: sErr } = await supabase
      .from('roadmaps')
      .insert({ user_id: req.user.id, roadmap_json: roadmap })
      .select()
      .single()
    if (sErr) throw sErr
    res.json(saved)
  } catch (err) {
    next(err)
  }
})

// GET /me/roadmap — latest saved roadmap
router.get('/roadmap', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', req.user.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// POST /me/topics/:topicId/complete — tick a topic done
router.post('/topics/:topicId/complete', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('user_topics')
      .upsert({ user_id: req.user.id, topic_id: req.params.topicId, completed_at: new Date().toISOString() })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// DELETE /me/topics/:topicId/complete — untick
router.delete('/topics/:topicId/complete', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('user_topics')
      .update({ completed_at: null })
      .eq('user_id', req.user.id)
      .eq('topic_id', req.params.topicId)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
