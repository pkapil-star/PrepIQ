const express = require('express')
const supabase = require('../lib/supabaseClient')

const router = express.Router()

// GET /companies
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('companies').select('*').order('name')
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
