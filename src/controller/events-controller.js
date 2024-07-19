const pool = require('../db/db')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error
    })
  }
}

module.exports = {
  getAll
}
