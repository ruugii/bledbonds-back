const pool = require('../db/db')

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

    await pool.query('INSERT INTO chat (name) VALUES (?)', [`Cita a ciega ${idUser} con ${idRandom}`])
    const [chatRows] = await pool.query('SELECT * FROM chat WHERE name = ?', [`Cita a ciega ${idUser} con ${idRandom}`])

    if (chatRows.length === 0) {
      throw new Error('Chat creation failed')
    }

    const chatId = chatRows[0].ID

    await pool.query('INSERT INTO user_chat (ID_user, ID_chat) VALUES (?, ?)', [idUser, chatId])
    await pool.query('INSERT INTO user_chat (ID_user, ID_chat) VALUES (?, ?)', [idRandom, chatId])

    return res.status(200).json({
      message: 'Se ha creado la cita a ciegas con éxito'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

module.exports = {
  create
}
