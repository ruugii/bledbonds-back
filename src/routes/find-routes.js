const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const findController = require('../controller/find-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  findController.getAll
)

module.exports = router
