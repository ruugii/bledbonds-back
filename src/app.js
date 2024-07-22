const { Server } = require('socket.io')
const { createServer } = require('http')
const express = require('express')
const cors = require('cors')
const { PORT } = require('./config')
const pool = require('./db/db')
const multer = require('multer')

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
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('chat message', async (msg) => {
    pool.query('INSERT INTO message (ID_User, ID_Chat, Message) VALUES (?, ?, ?)', [msg.userId, msg.chatId, msg.message])
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
app.use('/api/v1/newsletters', require('./routes/newsletter-routes'))
app.use('/api/v1/category', require('./routes/category-routes'))
app.use('/api/v1/blog', require('./routes/blog-routes'))

// Uncomment and add the events routes when ready
app.use('/api/v1/events', require('./routes/events-routes'))

app.use('/api/v1/img', require('./routes/img-routes'))
