const pool = require('../db/db')
const { knowTokenData } = require('../functions/knowTokenData')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events')
    res.status(200).json(rows)
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
    const [eventChatRows] = await pool.query('SELECT * FROM event_chat WHERE id_event = ?', [id])

    if (eventChatRows.length === 0) {
      return res.status(404).json({ message: 'Event chat not found' })
    }

    const chatId = eventChatRows[0].ID
    console.log(chatId)

    // Fetch chat information
    const [chatInfoRows] = await pool.query('SELECT * FROM chat WHERE id = ?', [chatId])

    if (chatInfoRows.length === 0) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const chatInfo = chatInfoRows[0]

    // Fetch messages
    const [messages] = await pool.query('SELECT * FROM message WHERE id_chat = ?', [chatId])

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
      console.log(knowTokenData(req.headers['user-key']))
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { id } = req.params
    const { name, description, date, place } = req.body

    console.log(req.body)

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
      console.log(knowTokenData(req.headers['user-key']))
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { id } = req.params

    console.log(req.body)
    await pool.query('DELETE FROM participants WHERE id_event = ?', [id])
    await pool.query('DELETE FROM event_chat WHERE ID_event = ?', [id])
    await pool.query('DELETE FROM events WHERE id = ?', [id])

    res.status(200).json({ message: 'Event updated' })
  } catch (error) {
    console.log(error)
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
      console.log(tokenData)
      return res.status(403).json({ message: 'Forbidden' })
    }

    console.log(req.body)

    const { name, description, date, place, url } = req.body

    // Start a transaction
    await pool.query('START TRANSACTION')

    // Insert event
    await pool.query(
      'INSERT INTO events (event_name, event_description, event_date, event_location) VALUES (?, ?, ?, ?)',
      [name, description, date, place]
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

    await pool.query(
      'INSERT INTO eventsImage (eventId, eventImageURL) VALUES (?, ?)',
      [eventId, url.url]
    )
    // Insert chat
    await pool.query('INSERT INTO chat (name) VALUES (?)', [name])

    // Retrieve the newly inserted chat
    const [chatResults] = await pool.query('SELECT * FROM chat WHERE name = ?', [name])

    if (chatResults.length === 0) {
      throw new Error('Failed to retrieve the newly created chat')
    }

    const chatId = chatResults[0].ID

    // Insert event_chat
    await pool.query('INSERT INTO event_chat (ID_event, ID_chat) VALUES (?, ?)', [eventId, chatId])

    // Commit the transaction
    await pool.query('COMMIT')

    res.status(201).json({ message: 'Event created' })
  } catch (error) {
    console.log(error)

    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')

    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

module.exports = {
  getAll,
  getParticipants,
  getChat,
  updateEvent,
  deleteEvent,
  createEvent
}
