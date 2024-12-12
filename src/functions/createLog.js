const pool = require('../db/db')

const createLog = async (userId, action, explanation) => {
  try {
    if (userId === undefined) {
      userId = 0
    } else if (userId === null) {
      userId = 0
    } else if (userId === '') {
      userId = 0
    }
    await pool.query('INSERT INTO logs(user_id, action, explanation) VALUES (?, ?, ?)', [userId || '0', action, explanation])
    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

module.exports = createLog