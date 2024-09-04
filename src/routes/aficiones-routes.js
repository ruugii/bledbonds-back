const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const router = Router()
const aficionController = require('../controller/aficion-controller')

router.post(
  '/uploadAficion',
  verifyAPIKey,
  aficionController.uploadAficion
)

module.exports = router
