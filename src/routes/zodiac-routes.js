const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const zodiacController = require('../controller/zodiac-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  zodiacController.getAll
)

module.exports = router
