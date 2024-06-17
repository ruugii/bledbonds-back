const { API_KEY } = require('../config')

const verifyAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey === API_KEY) {
    next()
  } else {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

module.exports = verifyAPIKey
