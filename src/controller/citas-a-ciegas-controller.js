const pool = require('../db/db')
const createLog = require('../functions/createLog')

const create = async (req, res) => {
  try {
    const idUser = req.body.ID
    let idRandom = 0

    // Ensure we have at least one different user
    const [users] = await pool.query('SELECT * FROM citas_a_ciegas')
    if (users.length < 2) {
      return res.status(400).json({
        message: 'Not enough users for a blind date'
      })
    }

    do {
      const userRandom = Math.floor(Math.random() * users.length)
      idRandom = users[userRandom].ID_User
    } while (idRandom === idUser)

    let [nextChatId] = await pool.query('SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `chat`')
    nextChatId = nextChatId[0].next_id
    // Insert chat
    await pool.query('INSERT INTO chat (ID, name) VALUES (?, ?)', [nextChatId, `Cita a ciega ${idUser} con ${idRandom}`])
    const [chatRows] = await pool.query('SELECT * FROM chat WHERE name = ?', [`Cita a ciega ${idUser} con ${idRandom}`])

    if (chatRows.length === 0) {
      throw new Error('Chat creation failed')
    }

    const chatId = chatRows[0].ID

    let [nextApuntadoId] = await pool.query('SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `user_chat`')
    nextApuntadoId = nextApuntadoId[0].next_id
    await pool.query('INSERT INTO user_chat (ID, ID_user, ID_chat) VALUES (?, ?, ?)', [nextApuntadoId, idUser, chatId])
    let [nextUserChatId] = await pool.query('SELECT COALESCE(MAX(ID) + 1, 1) AS next_id FROM `user_chat`')
    nextUserChatId = nextUserChatId[0].next_id
    await pool.query('INSERT INTO user_chat (ID, ID_user, ID_chat) VALUES (?, ?, ?)', [nextUserChatId, idRandom, chatId])
    createLog(idUser, 'create citas-a-ciegas-controller - 40', `Creación de cita a ciegas ${idUser} con ${idRandom}`)
    return res.status(200).json({
      message: 'Se ha creado la cita a ciegas con éxito'
    })
  } catch (error) {
    createLog('', 'create citas-a-ciegas-controller - 45', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

module.exports = {
  create
}
