const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const router = Router()

const masterdataController = require('../controller/masterdata-controller.js')
const masterdataValidator = require('../middlewares/objects-validators/masterdata-validators.js')

router.get(
  '/getAppOptionEnabled/:key',
  verifyAPIKey,
  masterdataController.getByKey
)

router.put(
  '/getAppOptionEnabled',
  verifyAPIKey,
  masterdataValidator.update,
  masterdataController.update
)

module.exports = router
