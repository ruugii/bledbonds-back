const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const router = Router()

router.get(
  '/',
  verifyAPIKey,
  (req, res) => {
    res.status(200).json({
      message: 'Logs',
      logs: []
    })
  }
)