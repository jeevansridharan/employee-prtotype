require('dotenv').config()
const app = require('./src/server')
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Time-log prototype listening on http://localhost:${PORT}`)
})
