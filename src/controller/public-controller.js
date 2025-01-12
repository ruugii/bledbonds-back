const pool = require('../db/db')

const getPlayers = async (req, res) => {
  try {
    const [players] = await pool.query('SELECT * FROM players')
    res.status(200).json({
      code: 200,
      message: 'Success',
      data: players,
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  getPlayers,
}