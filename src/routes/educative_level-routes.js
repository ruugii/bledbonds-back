const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const educative_levelController = require('../controller/educative_level-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  educative_levelController.getAll
)

module.exports = router
