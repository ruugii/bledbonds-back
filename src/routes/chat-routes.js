const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const chatController = require('../controller/chat-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  chatController.getAll
)

router.get(
  '/:id/',
  verifyAPIKey,
  chatController.getChat
)

module.exports = router
