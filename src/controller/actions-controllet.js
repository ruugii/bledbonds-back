const pool = require('../db/db')
const { knowTokenData } = require('../functions/knowTokenData')

const like = async (req, res) => {
  try {
    const id = knowTokenData(req.headers['user-token']).id
    const { idUser, action } = req.body
    await pool.query('INSERT INTO actions (id_user, id_action, id_liked) VALUES (?, ?, ?)', [id, action, idUser])
    const [IsMatch] = await pool.query('SELECT * FROM actions WHERE id_user = ? AND id_action = ? AND id_liked = ?', [idUser, '1', id])
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [idUser])
    const [user2] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    const name = `${user[0].name} - ${user2[0].name}`
    if (IsMatch.length !== 0) {
      await pool.query('INSERT INTO chat (name) VALUES (?)', [name])

      // Retrieve the newly inserted chat
      const [chatResults] = await pool.query('SELECT * FROM chat WHERE name = ?', [name])

      if (chatResults.length === 0) {
        throw new Error('Failed to retrieve the newly created chat')
      }

      const chatId = chatResults[0].ID
      await pool.query('INSERT INTO user_chat (ID_user, ID_chat) VALUES (?, ?)', [id, chatId])
      await pool.query('INSERT INTO user_chat (ID_user, ID_chat) VALUES (?, ?)', [idUser, chatId])
      return res.status(200).json({
        message: 'Like created successfully',
        url: `https://bledbonds.es/chat/${chatId}`,
        IsMatch: true
      })
    } else if (IsMatch.length === 0) {
      return res.status(200).json({
        message: 'Like created successfully',
        IsMatch: false
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/actions-controllet.js',
      error
    })
  }
}

const dislike = async (req, res) => {
  try {
    const id = knowTokenData(req.headers['user-token']).id
    const { idUser, action } = req.body
    await pool.query('INSERT INTO actions (id_user, id_action, id_liked) VALUES (?, ?, ?)', [id, action, idUser])
    return res.status(200).json({
      message: 'Dislike created successfully'
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/actions-controllet.js',
      error
    })
  }
}

module.exports = {
  like,
  dislike
}
