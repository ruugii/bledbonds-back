const pool = require('../db/db')
const createLog = require('../functions/createLog')
const { knowTokenData } = require('../functions/knowTokenData')

const getAllFuture = async (req, res) => {
  try {
    createLog(0, 'getAllFuture', `Obtención de eventos futuros`)
    const [rows] = await pool.query('SELECT events.*, eventsImage.eventImageURL FROM events LEFT JOIN eventsImage ON events.id = eventsImage.eventId WHERE events.event_date >= CURDATE();')
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getAllFuture', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getParticipants = async (req, res) => {
  try {
    createLog(0, 'getParticipants', `Obtención de participantes del evento ${req.params.id}`)
    const { id } = req.params
    const [rows] = await pool.query('SELECT users.* FROM participants JOIN users ON participants.id_user = users.id WHERE participants.id_event = ?', [id])
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getParticipants', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getChat = async (req, res) => {
  try {
    createLog(0, 'getChat', `Obtención de chat del evento ${req.params.id}`)
    const { id } = req.params

    // Fetch event chat information
    const [eventChatRows] = await pool.query('SELECT * FROM event_chat WHERE id_event = ?', [id])

    if (eventChatRows.length === 0) {
      return res.status(404).json({ message: 'Event chat not found' })
    }

    const chatId = eventChatRows[0].ID_chat

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
    createLog('', 'getChat', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message // Send the error message instead of the entire error object
    })
  }
}

const updateEvent = async (req, res) => {
  try {
    createLog(0, 'updateEvent', `Actualización de evento ${req.params.id}`)
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
    createLog('', 'updateEvent', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const deleteEvent = async (req, res) => {
  try {
    createLog(0, 'deleteEvent', `Eliminación de evento ${req.params.id}`)
    if (!req.headers['user-key']) {
      return res.status(401).json({ message: 'Unauthorized' })
    } else if (knowTokenData(req.headers['user-key']).role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { id } = req.params
    await pool.query('DELETE FROM eventsImage WHERE eventId = ?', [id])
    await pool.query('DELETE FROM participants WHERE id_event = ?', [id])
    await pool.query('DELETE FROM event_chat WHERE ID_event = ?', [id])
    const [fotos] = await pool.query('SELECT * FROM events_fotos WHERE event_id = ?', [id])
    if (fotos.length > 0) {
      await pool.query('DELETE FROM events_fotos WHERE event_id = ?', [id])
    }
    await pool.query('DELETE FROM message WHERE id_chat = (SELECT ID_chat FROM event_chat WHERE ID_event = ?)', [id])
    await pool.query('DELETE FROM user_chat WHERE ID_Chat = (SELECT ID_chat FROM event_chat WHERE ID_event = ?)', [id])
    await pool.query('DELETE FROM chat WHERE id = (SELECT ID_chat FROM event_chat WHERE ID_event = ?)', [id])
    await pool.query('DELETE FROM events WHERE id = ?', [id])

    res.status(200).json({ message: 'Event deleted' })
  } catch (error) {
    createLog('', 'deleteEvent', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const createEvent = async (req, res) => {
  try {
    createLog(0, 'createEvent', `Creación de evento ${req.body.name}`)
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
    // Insert event
    let [rows] = await pool.query(
      'SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `events`'
    )
    let nextId = rows[0].next_id
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
      console.log(name)
      console.log(description)
      console.log(date)
      console.log(place)
      throw new Error('Failed to retrieve the newly created event')
    }

    const eventId = eventResults[0].id
    rows = await pool.query(
      'SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `eventsImage`'
    )

    rows = [rows]

    nextId = rows[0].next_id

    await pool.query(
      'INSERT INTO eventsImage (id, eventId, eventImageURL) VALUES (?, ?, ?)',
      [nextId, eventId, url.url]
    );

    // Insert chat
    [rows] = await pool.query(
      'SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `chat`'
    )
    await pool.query('INSERT INTO chat (ID, name) VALUES (?, ?)', [rows[0].next_id, name])

    // Retrieve the newly inserted chat
    const [chatResults] = await pool.query('SELECT * FROM chat WHERE name = ?', [name])

    if (chatResults.length === 0) {
      throw new Error('Failed to retrieve the newly created chat')
    }

    const chatId = chatResults[0].ID

    // Insert event_chat
    rows = [await pool.query(
      'SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `event_chat`'
    )]

    await pool.query('INSERT INTO event_chat (ID, ID_event, ID_chat) VALUES (?, ?, ?)', [rows[0].next_id, eventId, chatId])

    // Commit the transaction
    await pool.query('COMMIT')

    res.status(201).json({ message: 'Event created' })
  } catch (error) {
    createLog('', 'createEvent', error)
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK')

    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

const newParticipants = async (req, res) => {
  try {
    createLog(0, 'newParticipants', `Nuevo participante en evento ${req.params.eventId}`)
    const { eventId } = req.params

    const token = req.headers['x-user-key']

    const userId = knowTokenData(token).id
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId])
    const [isApuntado] = await pool.query('SELECT * FROM participants WHERE id_user = ? AND id_event = ?', [userId, eventId])

    if (user.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        status: 404
      })
    }

    if (events.length === 0) {
      return res.status(400).json({
        message: 'El evento no existe',
        status: 400
      })
    }

    if (isApuntado.length > 0) {
      return res.status(400).json({
        message: 'El usuario ya ha sido',
        status: 400
      })
    } else {
      const [rows] = await pool.query(
        'SELECT COALESCE(MAX(id_participant) + 1, 1) AS next_id FROM `participants`'
      )
      pool.query('INSERT INTO participants (id_participant, id_event, id_user) VALUES (?, ?, ?)', [rows[0].next_id, eventId, userId])
    }

    const [chat] = await pool.query('SELECT * FROM event_chat WHERE ID_event = ?', [eventId])

    const [rows] = await pool.query(
      'SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `user_chat`'
    )
    await pool.query('INSERT INTO user_chat (ID, ID_user, ID_Chat) VALUES (?, ?, ?)', [rows[0].next_id, userId, chat[0].ID_chat])

    return res.status(200).json({
      message: 'Apuntado correctamente',
      status: 200
    })
  } catch (e) {
    createLog('', 'newParticipants', e)
    return res.status(500).json({
      message: 'Internal server error',
      error: e.message,
      status: 500
    })
  }
}

const getOne = async (req, res) => {
  try {
    createLog(0, 'getOne', `Obtención de evento ${req.params.id}`)
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id])
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getOne', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getAll = async (req, res) => {
  try {
    createLog(0, 'getAll', `Obtención de eventos`)
    const [rows] = await pool.query('SELECT events.*, eventsImage.eventImageURL FROM events LEFT JOIN eventsImage ON events.id = eventsImage.eventId;')
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getAll', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getPast = async (req, res) => {
  try {
    createLog(0, 'getPast', `Obtención de eventos pasados`)
    const [rows] = await pool.query('SELECT events.*, eventsImage.eventImageURL FROM events LEFT JOIN eventsImage ON events.id = eventsImage.eventId WHERE CURDATE() >= events.event_date;')
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getPast', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  getOne,
  getAll,
  getChat,
  getPast,
  updateEvent,
  deleteEvent,
  createEvent,
  getAllFuture,
  getParticipants,
  newParticipants
}
