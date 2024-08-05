const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const languageController = require('../controller/language-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  languageController.getAll
)

module.exports = router
