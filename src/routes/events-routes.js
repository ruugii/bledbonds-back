const { Router } = require('express')
const verifyAPIKey = require('../middlewares/verifyAPIKey')
const eventsController = require('../controller/events-controller')

const router = Router()

router.get(
  '/',
  verifyAPIKey,
  eventsController.getAllFuture
)

router.get(
  '/all',
  verifyAPIKey,
  eventsController.getAll
)

router.get(
  '/past',
  verifyAPIKey,
  eventsController.getPast
)

router.get(
  '/:id',
  verifyAPIKey,
  eventsController.getOne
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

router.post(
  '/newParticipants/:eventId',
  verifyAPIKey,
  eventsController.newParticipants
)

module.exports = router
