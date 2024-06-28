const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const categoryController = require('../controller/blog-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  categoryController.getAll
)

router.get(
  '/:id',
  verifyAPIKey,
  categoryController.getById
)

router.post(
  '/create',
  verifyAPIKey,
  categoryController.create
)

module.exports = router
