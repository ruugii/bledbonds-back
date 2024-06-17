function getRandomToken () {
  const aux = Math.random().toString(36).substring(2, 15)
  console.log(aux)
  return aux
}

module.exports = { getRandomToken }
