const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const categoryController = require('../controller/category-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  categoryController.getAll
)

router.post(
  '/create',
  verifyAPIKey,
  categoryController.create
)

module.exports = router
