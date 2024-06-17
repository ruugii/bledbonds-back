const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { PORT } = require('./config')
const e = require('cors')

// Initialize express app
const app = express()

const port = PORT || 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.use(express.json())

app.use(cors())

app.use(express.static('public'))

app.use(
  '/api/v1/users',
  require('./routes/user-routes')
)

app.use(
  '/api/v1/genders',
  require('./routes/genders-routes')
)

app.use(
  '/api/v1/newsletters',
  require('./routes/newsletter-routes')
)
