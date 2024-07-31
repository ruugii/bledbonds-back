const update = (req, res, next) => {
  if (!req.body.key || !req.body.value) {
    return res.status(400).json({
      message: 'Missing parameters',
      fields: {
        key: 'key is required',
        value: 'value is required'
      }
    })
  } else if (req.body.value !== '1' && req.body.value !== '0') {
    return res.status(400).json({
      message: 'Invalid value',
      fields: {
        value: 'value must be 0 or 1'
      }
    })
  }
  next()
}

module.exports = {
  update
}