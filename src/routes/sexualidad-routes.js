const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const sexualidadController = require('../controller/sexualidad-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  sexualidadController.getAll
)

module.exports = router
