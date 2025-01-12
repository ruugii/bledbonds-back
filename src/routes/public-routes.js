const { Router } = require('express')

const router = Router()

const publicController = require('../controller/public-controller')

router.get(
  '/players',
  publicController.getPlayers
)

module.exports = router