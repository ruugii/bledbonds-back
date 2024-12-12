const pool = require('../db/db')
const createLog = require('../functions/createLog')
const { knowTokenData } = require('../functions/knowTokenData')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT blog.*, category.name AS category, users.name AS postBy FROM blog LEFT JOIN category ON blog.id_category = category.id LEFT JOIN users ON blog.created_by = users.id;')
    res.status(200).json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/genere-controller.js',
      error: error
    })
  }
}

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT blog.*, category.name AS category, users.name AS postBy FROM blog LEFT JOIN category ON blog.id_category = category.id LEFT JOIN users ON blog.created_by = users.id WHERE blog.id = ?;', [req.params.id])
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
    const { title, resume, text, category, token } = req.body
    if (!title || !resume || !text || !category || !token) {
      return res.status(400).json({
        message: 'All fields are required',
        title: title,
        resume: resume,
        text: text,
        category: category,
        token: token
      })
    }
    const tokenDecoded = knowTokenData(token)
    const [idCategory] = await pool.query('SELECT id FROM category WHERE name = ?', [category])
    let [nextId] = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `blog`')
    nextId = nextId[0].next_id
    const [rows] = await pool.query('INSERT INTO blog (id, title, resume, content, id_category, created_by) VALUES (?, ?, ?, ?, ?, ?)', [nextId, title, resume, text, idCategory[0].id, tokenDecoded.id])
    createLog(tokenDecoded.id, 'create blog-controller - 49', `Creación de blog ${title}`)
    if (rows) {
      res.status(201).json({
        message: 'Blog created successfully'
      })
    } else {
      res.status(400).json({
        message: 'Error creating blog'
      })
    }
  } catch (error) {
    createLog('', 'create blog-controller - 60', error)
    res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  create,
  getAll,
  getById,
}
