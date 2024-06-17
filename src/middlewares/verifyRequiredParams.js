function verifyRequiredParams (requiredParams, req, res) {
  const missingParams = []
  for (const i of requiredParams) if (!req.body[i]) missingParams.push(i)
  const requiredParamsError = 'Missing required params: ' + missingParams.join(', ')
  if (missingParams.length > 0) return requiredParamsError
  else return 0
}

module.exports = verifyRequiredParams
