const supabase = require('./supabaseClient')

// Express middleware: verifies the Supabase Auth JWT from "Authorization: Bearer <token>"
// and sets req.user. All /me routes use it so a user can only touch their own rows.
async function requireUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Not logged in' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return res.status(401).json({ error: 'Session expired — log in again' })

    req.user = data.user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = requireUser
