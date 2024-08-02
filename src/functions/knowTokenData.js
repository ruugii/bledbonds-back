const jwt = require('jsonwebtoken')

const knowTokenData = (token) => {
  const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET)
  return tokenDecoded
}

module.exports = {
  knowTokenData
}
