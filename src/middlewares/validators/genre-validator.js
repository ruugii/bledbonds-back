const pool = require('../../db/db')

const genreValidator = async (genre) => {
  const genreError = []
  const [rows] = await pool.query('SELECT * FROM genre WHERE genre_name = ?', [genre])
  if (rows.length === 0) {
    genreError.push('Invalid genre')
  }
  return genreError
}

module.exports = genreValidator
