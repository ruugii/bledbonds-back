const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

const knowTokenData = (token) => {
  const tokenDecoded = jwt.verify(token, JWT_SECRET)
  return tokenDecoded
}

module.exports = {
  knowTokenData
}
