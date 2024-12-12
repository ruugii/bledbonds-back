const pool = require('../db/db')
const createLog = require('../functions/createLog')

const getByKey = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM MASTER_DATA WHERE Master LIKE ? AND Clave = ?', ['app_enable_option', req.params.key])
    return res.status(200).json(rows[0])
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/masterdata-controller.js',
      error: error
    })
  }
}

const update = async (req, res) => {
  try {
    const [rows] = await pool.query('UPDATE MASTER_DATA SET Valor = ? WHERE Master = ? AND Clave = ?', [req.body.value, 'app_enable_option', req.body.key])
    createLog(0, 'update', `Actualización de opción ${req.body.key}`)
    return res.status(200).json(rows)
  } catch (error) {
    createLog('', 'update', error)
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/masterdata-controller.js',
      error: error
    })
  }
}

module.exports = {
  getByKey,
  update
}
