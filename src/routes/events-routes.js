const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const eventsController = require('../controller/events-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  eventsController.getAll
)

router.post(
  '/create',
  verifyAPIKey,
  eventsController
)

module.exports = router
