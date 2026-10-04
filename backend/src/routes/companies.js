const express = require('express')
const supabase = require('../lib/supabaseClient')

const router = express.Router()

// GET /companies
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('companies').select('*')
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /companies/:id/roles
router.get('/:id/roles', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('company_id', req.params.id)
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
