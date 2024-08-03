const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const estadoCivilController = require('../controller/estado-civil-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  estadoCivilController.getAll
)

module.exports = router
