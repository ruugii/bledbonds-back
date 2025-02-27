const pool = require('../db/db')
const { knowTokenData } = require('../functions/knowTokenData')

const getAll = async (req, res) => {
  try {
    const user_token = req.headers['user-token']
    const data = knowTokenData(user_token)
    const userId = data.id
    const isWeb = req.headers.web ? true : false
    let roles = []
    if (isWeb) {
      [roles] = await pool.query('SELECT * FROM users_role WHERE user_id = ? AND role_id = (SELECT id FROM role WHERE name = "admin")', [userId])
    }
    if (roles.length === 0) {
      const [rows] = await pool.query('SELECT * FROM user_chat WHERE ID_user = ?', [userId])
      const chats = []
      for (const chat of rows) {
        const [chat_] = await pool.query('SELECT chat.* FROM chat WHERE ID = ?', [chat.ID_chat])
        chats.push(chat_[0])
      }
      res.status(200).json(chats)
    } else {
      const [chats] = await pool.query('SELECT * FROM chat;')
      res.status(200).json(chats)
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getParticipants = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT users.* FROM participants JOIN users ON participants.id_user = users.id WHERE participants.id_event = ?', [id])
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getChat = async (req, res) => {
  try {
    const { id } = req.params

    // Fetch event chat information
    const [eventChatRows] = await pool.query('SELECT * FROM chat WHERE ID = ?', [id])

    if (eventChatRows.length === 0) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const chatInfo = eventChatRows[0]

    // Fetch messages
    const [messages] = await pool.query('SELECT * FROM message WHERE id_chat = ?', [chatInfo.ID])
    const user_token = req.headers['user-token']
    const data = knowTokenData(user_token)
    const userId = data.id
    for (const message of messages) {
      if (message.ID_user === userId) {
        message.user = true
      } else {
        message.user = false
      }
    }

    // Construct response
    const chatResponse = {
      chatId: chatInfo.ID,
      chatName: chatInfo.name,
      messages
    }

    res.status(200).json(chatResponse)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message // Send the error message instead of the entire error object
    })
  }
}

const updateEvent = async (req, res) => {
  try {
    if (!req.headers['user-key']) {
      return res.status(401).json({ message: 'Unauthorized' })
    } else if (knowTokenData(req.headers['user-key']).role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { id } = req.params
    const { name, description, date, place } = req.body

    await pool.query('UPDATE events SET event_name = ?, event_description = ?, event_date = ?, event_location = ? WHERE id = ?', [name, description, date, place, id])

    res.status(200).json({ message: 'Event updated' })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const deleteEvent = async (req, res) => {
  try {
    if (!req.headers['user-key']) {
      return res.status(401).json({ message: 'Unauthorized' })
    } else if (knowTokenData(req.headers['user-key']).role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { id } = req.params

    await pool.query('DELETE FROM participants WHERE id_event = ?', [id])
    await pool.query('DELETE FROM event_chat WHERE ID_event = ?', [id])
    await pool.query('DELETE FROM events WHERE id = ?', [id])

    res.status(200).json({ message: 'Event updated' })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const createEvent = async (req, res) => {
  try {
    const userKey = req.headers['user-key']
    if (!userKey) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const tokenData = knowTokenData(userKey)
    if (tokenData.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { name, description, date, place, url } = req.body

    // Start a transaction
    await pool.query('START TRANSACTION')

    let [nextId] = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `events`')
    nextId = nextId[0].next_id
    // Insert event
    await pool.query(
      'INSERT INTO events (id, event_name, event_description, event_date, event_location) VALUES (?, ?, ?, ?, ?)',
      [nextId, name, description, date, place]
    )

    // Retrieve the newly inserted event
    const [eventResults] = await pool.query(
      'SELECT * FROM events WHERE event_name = ? AND event_description = ? AND event_date = ? AND event_location = ?',
      [name, description, date, place]
    )

    if (eventResults.length === 0) {
      throw new Error('Failed to retrieve the newly created event')
    }

    const eventId = eventResults[0].id

    let [eventsImageId] = await pool.query('SELECT id FROM events WHERE id = ?', [nextId]) 
    eventsImageId = eventsImageId[0].id
    await pool.query(
      'INSERT INTO eventsImage (id, eventId, eventImageURL) VALUES (?, ?, ?)',
      [eventsImageId, eventId, url.url]
    )

    let [chatNextId] = await pool.query('SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `chat`')
    chatNextId = chatNextId[0].next_id
    // Insert chat
    await pool.query('INSERT INTO chat (ID, name) VALUES (?, ?)', [chatNextId, name])

    // Retrieve the newly inserted chat
    const [chatResults] = await pool.query('SELECT * FROM chat WHERE name = ?', [name])

    if (chatResults.length === 0) {
      throw new Error('Failed to retrieve the newly created chat')
    }

    const chatId = chatResults[0].ID

    // Insert event_chat
    let [eventChatNextId] = await pool.query('SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `event_chat`')
    eventChatNextId = eventChatNextId[0].next_id
    await pool.query('INSERT INTO event_chat (ID, ID_event, ID_chat) VALUES (?, ?, ?)', [eventChatNextId, eventId, chatId])

    // Commit the transaction
    await pool.query('COMMIT')

    res.status(201).json({ message: 'Event created' })
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')

    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const getAllAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chat;')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  getAll,
  getParticipants,
  getChat,
  updateEvent,
  deleteEvent,
  createEvent,
  getAllAdmin
}
