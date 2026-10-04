const express = require('express')
const supabase = require('../lib/supabaseClient')

const router = express.Router()

// GET /roles/:id/weightage
router.get('/:id/weightage', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('role_topic_weightage')
      .select('weight, round_type, source_count, topics(id, name, category)')
      .eq('role_id', req.params.id)
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
