const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const userController = require('../controller/user-controller')
const userValidator = require('../middlewares/objects-validators/user-validator')

const router = Router()

router.post(
  '/register/',
  verifyAPIKey,
  userValidator.create,
  userController.register
)

router.put(
  '/activate/:validateCode',
  verifyAPIKey,
  userValidator.activate,
  userController.activate
)

router.post(
  '/loginByCode/',
  verifyAPIKey,
  userValidator.loginByCode,
  userController.loginByCode
)

router.post(
  '/loginByCode/:code',
  verifyAPIKey,
  userValidator.loginByCode,
  userController.loginByCode2
)

router.post(
  '/login/',
  verifyAPIKey,
  userValidator.login,
  userController.login
)

router.get(
  '/list/',
  verifyAPIKey,
  userController.list
)

router.get(
  '/isPerfilCompleto/',
  verifyAPIKey,
  userController.isPerfilCompleto
)

router.get(
  '/get/token',
  verifyAPIKey,
  userController.getToken
)

router.put(
  '/update',
  verifyAPIKey,
  userController.update
)

router.get(
  '/get/toLike',
  verifyAPIKey,
  userController.getToLike
)

module.exports = router
