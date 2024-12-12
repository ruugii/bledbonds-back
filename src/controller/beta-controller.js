const pool = require("../db/db")

const create = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        message: 'All fields are required',
        email: email
      })
    }

    const [exisits] = await pool.query('SELECT * FROM beta WHERE email = ?', [email])

    if (exisits.length > 0) {
      await pool.query('UPDATE beta SET updated_at = CURRENT_TIMESTAMP WHERE email = ?', [email])
      return res.status(400).json({
        message: 'Beta already exists'
      })
    }

    await pool.query('INSERT INTO beta (email) VALUES (?)', [email])
    const [rows] = await pool.query('SELECT * FROM beta WHERE email = ?', [email])
    if (rows.length > 0) {
      res.status(201).json({
        message: 'Beta created successfully'
      })
    } else {
      res.status(400).json({
        message: 'Error creating beta'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM beta')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  create,
  getAll
}