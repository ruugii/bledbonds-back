const pool = require('../db/db')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/genere-controller.js',
      error: error
    })
  }
}

const create = async (req, res) => {
  try {
    const { name } = req.body
    await pool.query('INSERT INTO category (name) VALUES (?)', [name])
    res.status(201).json({
      message: 'Category created successfully',
      category: { name }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  getAll,
  create
}
