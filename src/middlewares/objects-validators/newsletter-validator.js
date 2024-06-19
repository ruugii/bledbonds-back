const emailValidator = require('../validators/email-validator')
const verifyRequiredParams = require('../verifyRequiredParams')
const pool = require('../../db/db')

const create = async (req, res, next) => {
  try {
    const requiredParams = ['email']
    if (verifyRequiredParams(requiredParams, req, res) === 0) {
      const errors = [
        await emailValidator(req.body.email, 255, false)
      ]
      const filteredErrors = errors.filter(error => error.length > 0)
      const mappedErrors = filteredErrors.map((error, index) => ({ [index]: error }))
      const response = { message: 'Validation errors', errors: mappedErrors }
      const [r] = await pool.query('SELECT * FROM newsletter WHERE email = ?', [req.body.email])
      if (r.length > 0) return res.status(400).json({ message: 'Email already registered' })
      if (errors.some(error => error.length > 0)) return res.status(400).json(response)
      return next()
    } else {
      return res.status(400).json({
        message: 'Missing required params'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/middlewares/objects-validators/newsletter-validator.js',
      error: error
    })
  }
}

const activate = async (req, res, next) => {
  try {
    if (req.params.validateCode === undefined) return res.status(400).json({ message: 'Missing required params' })
    if (`${req.params.validateCode}`.length !== 6) return res.status(400).json({ message: 'Invalid validation code' })
    const [r] = await pool.query('SELECT * FROM users_activation WHERE validationCode = ?', [req.params.validateCode])
    if (r.length === 0) return res.status(200).json({ message: 'Invalid validation code' })
    next()
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', path: 'src/middlewares/objects-validators/newsletter-validator.js', error: error })
  }
}

const deleteEmail = async (req, res, next) => {
  try {
    if (req.params.email === undefined) {
      return res.status(400).json({
        message: 'Missing required params',
        status: 400
      })
    }
    const errors = []
    const filteredErrors = errors.filter(error => error.length > 0)
    const mappedErrors = filteredErrors.map((error, index) => ({ [index]: error }))
    const response = { message: 'Validation errors', errors: mappedErrors }
    if (errors.some(error => error.length > 0)) return res.status(400).json({ response, status: 400 })
    const [r] = await pool.query('SELECT * FROM newsletter WHERE token = ?', [req.params.email])
    if (r.length === 0) return res.status(200).json({ message: 'Token not registered', codeResponse: '1001' })
    next()
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', path: 'src/middlewares/objects-validators/newsletter-validator.js', error: error, status: 500 })
  }
}

const send = async (req, res, next) => {
  try {
    const requiredParams = ['subject', 'text', 'title']
    if (verifyRequiredParams(requiredParams, req, res) === 0) {
      return next()
    } else {
      return res.status(400).json({
        message: 'Missing required params'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error
    })
  }
}

module.exports = {
  create,
  activate,
  deleteEmail,
  send
}
