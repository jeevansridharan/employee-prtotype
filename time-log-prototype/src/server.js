const express = require('express')
const routes = require('./routes')
const { init } = require('./db')

const app = express()
app.use(express.json())

// initialize DB (creates tables if missing)
init().catch(err => {
  console.error('DB init failed', err)
  process.exit(1)
})

app.use('/api', routes)

app.get('/', (req, res) => res.json({ok:true, msg:'time-log prototype'}))

module.exports = app
