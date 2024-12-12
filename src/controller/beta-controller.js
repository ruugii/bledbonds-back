const pool = require("../db/db")
const createLog = require("../functions/createLog")

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
    createLog(0, 'create beta-controller - 25', `Creación de beta de ${email}`)
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
    createLog('', 'create beta-controller - 36', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM beta')
    createLog(0, 'getAll beta-controller - 47', `Listado de betas`)
    res.status(200).json(rows)
  } catch (error) {
    createLog('', 'getAll beta-controller - 50', error)
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