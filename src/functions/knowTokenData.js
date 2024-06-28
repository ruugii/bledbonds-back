const jwt = require('jsonwebtoken')

const knowTokenData = (token) => {
  const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET)
  console.log(tokenDecoded)
  return tokenDecoded
}

module.exports = {
  knowTokenData
}
