const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const citasACieguasController = require('../controller/citas-a-ciegas-controller')

const router = Router()

router.post(
  '/create',
  verifyAPIKey,
  citasACieguasController.create
)

module.exports = router
