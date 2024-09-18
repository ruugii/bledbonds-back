const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const actionsController = require('../controller/actions-controllet')
const router = Router()

router.post(
  '/like',
  verifyAPIKey,
  actionsController.like
)

router.post(
  '/dislike',
  verifyAPIKey,
  actionsController.dislike
)

module.exports = router
