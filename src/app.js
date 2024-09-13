const { Server } = require('socket.io')
const { createServer } = require('http')
const express = require('express')
const cors = require('cors')
const { PORT } = require('./config')
const pool = require('./db/db')
const multer = require('multer')
const verifyAPIKey = require('./middlewares/verifyAPIKey')
const { knowTokenData } = require('./functions/knowTokenData')

// Initialize express app
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(multer({
  dest: 'public/img/'
}).single('image'))

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    const userID = knowTokenData(msg.token).id
    pool.query('INSERT INTO message (ID_User, ID_Chat, Message) VALUES (?, ?, ?)', [userID, msg.chatId, msg.message])
    io.emit(`chat message ${msg.chatId}`, msg)
  })
})

// Set the port from config or default to 3000
const port = PORT || 3000

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// Middleware setup
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

// Route handlers
app.use('/api/v1/users', require('./routes/user-routes'))
app.use('/api/v1/genders', require('./routes/genders-routes'))
app.use('/api/v1/find', require('./routes/find-routes'))
app.use('/api/v1/sexualidad', require('./routes/sexualidad-routes'))
app.use('/api/v1/estado-civil', require('./routes/estado-civil-routes'))
app.use('/api/v1/educative_level', require('./routes/educative_level-routes'))
app.use('/api/v1/language', require('./routes/language-routes'))
app.use('/api/v1/zodiac', require('./routes/zodiac-routes'))
app.use('/api/v1/religion', require('./routes/religion-routes'))
app.use('/api/v1/newsletters', require('./routes/newsletter-routes'))
app.use('/api/v1/category', require('./routes/category-routes'))
app.use('/api/v1/blog', require('./routes/blog-routes'))
app.use('/api/v1/img', require('./routes/img-routes'))

// Uncomment and add the events routes when ready
app.use('/api/v1/events', require('./routes/events-routes'))
app.use('/api/v1/chat', require('./routes/chat-routes'))

// Citas a ciegas
app.use('/api/v1/citas-a-ciegas', require('./routes/citas-a-ciegas-routes'))

// masterdata
app.use('/api/v1/masterdata', require('./routes/masterdata-routes'))

app.use('/api/v1/actions', require('./routes/actions-routes'))

app.use(verifyAPIKey, (req, res, next) => {
  res.status(404).json({
    message: 'Not found',
    route: req.url,
    method: req.method
  })
})
