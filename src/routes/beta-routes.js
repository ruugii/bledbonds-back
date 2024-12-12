const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const router = Router()

const betaController = require('../controller/beta-controller')

router.put(
  '/acces',
  verifyAPIKey,
  betaController.create
)

router.get(
  '/',
  verifyAPIKey,
  betaController.getAll
)

module.exports = router