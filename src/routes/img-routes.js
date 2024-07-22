const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')

const router = Router()
const imgValidator = require('../middlewares/imgValidator')
const imgController = require('../controller/img-controller')

router.post(
  '/upload',
  verifyAPIKey,
  imgValidator.uploadImg,
  imgController.uploadControll
)

router.delete(
  '/delete',
  verifyAPIKey,
  imgValidator.deleteImgValidation,
  imgController.deleteControll
)

module.exports = router
