const pool = require('../db/db')

const createLog = async (userId, action, explanation) => {
  try {
    if (userId === undefined || userId === null || userId === '') {
      userId = '0'
    }

    if (action === undefined || action === null || action === '') {
      action = 'undefined'
    }

    if (explanation === undefined || explanation === null || explanation === '') {
      explanation = 'undefined'
    }

    explanation = explanation.toString()
    await pool.query('INSERT INTO logs(user_id, action, explanation) VALUES (?, ?, ?)', [userId || '0', action, explanation])
    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

module.exports = createLog