const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const newsletterController = require('../controller/newsletter-controller.js')
const newsletterValidator = require('../middlewares/objects-validators/newsletter-validator.js')

const router = Router()

router.post(
  '/create/',
  verifyAPIKey,
  newsletterValidator.create,
  newsletterController.create
)
router.delete(
  '/delete/:email',
  verifyAPIKey,
  newsletterValidator.deleteEmail,
  newsletterController.deleteEmail
)

router.get(
  '/list/',
  verifyAPIKey,
  newsletterController.list
)

router.post(
  '/sendTest/',
  verifyAPIKey,
  newsletterValidator.send,
  newsletterController.sendTest
)

router.post(
  '/send/',
  verifyAPIKey,
  newsletterValidator.send,
  newsletterController.send
)

module.exports = router
