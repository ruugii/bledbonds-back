const jwt = require('jsonwebtoken')

async function createToken (data) {
  const token = jwt.sign(data, process.env.JWT_SECRET ? process.env.JWT_SECRET : 'secret')
  return token
}

module.exports = { createToken }
