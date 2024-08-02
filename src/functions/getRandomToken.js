function getRandomToken () {
  const aux = Math.random().toString(36).substring(2, 15)
  return aux
}

module.exports = { getRandomToken }
