const pool = require('../db/db')
const { knowTokenData } = require('../functions/knowTokenData')

const like = async (req, res) => {
  try {
    const id = knowTokenData(req.headers['user-token']).id
    const { idUser, action } = req.body
    await pool.query('INSERT INTO actions (id_user, id_action, id_liked) VALUES (?, ?, ?)', [id, action, idUser])
    const [IsMatch] = await pool.query('SELECT * FROM actions WHERE id_user = ? AND id_action = ? AND id_liked = ?', [idUser, '1', id])
    if (IsMatch.length !== 0) {
      return res.status(200).json({
        message: 'Like created successfully',
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
