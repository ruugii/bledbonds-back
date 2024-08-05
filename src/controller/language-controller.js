const pool = require('../db/db')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `lang`')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/language-controller.js',
      error
    })
  }
}

module.exports = {
  getAll
}
