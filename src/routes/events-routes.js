const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const eventsController = require('../controller/events-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  eventsController.getAll
)

router.get(
  '/:id/participants',
  verifyAPIKey,
  eventsController.getParticipants
)

router.get(
  '/:id/chat',
  verifyAPIKey,
  eventsController.getChat
)

router.put(
  '/:id/updateEvent',
  verifyAPIKey,
  eventsController.updateEvent
)

router.delete(
  '/:id/deleteEvent',
  verifyAPIKey,
  eventsController.deleteEvent
)

router.post(
  '/createEvent',
  verifyAPIKey,
  eventsController.createEvent
)

// router.post(
//   '/create',
//   verifyAPIKey,
//   eventsController
// )

module.exports = router
