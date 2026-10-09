const express = require('express')
const cors = require('cors')
require('dotenv').config()

const companiesRouter = require('./routes/companies')
const jobTitlesRouter = require('./routes/jobTitles')
const meRouter = require('./routes/me')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/companies', companiesRouter)
app.use('/job-titles', jobTitlesRouter)
app.use('/me', meRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Single shared error-handling middleware (RULES.md: one consistent error shape)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`PrepIQ backend listening on :${PORT}`))
