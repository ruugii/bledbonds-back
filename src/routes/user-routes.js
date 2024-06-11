const { Router } = require('express');
const verifyAPIKey = require('../middlewares/verifyAPIKey');

const userController = require('../controller/user-controller');
const userValidator = require('../middlewares/objects-validators/user-validator');

const router = Router();

router.post(
    '/register/',
    verifyAPIKey,
    userValidator.create,
    userController.register
);

router.put(
    '/activate/:validateCode',
    verifyAPIKey,
    userValidator.activate,
    userController.activate
)

router.post(
    '/login/',
    verifyAPIKey,
    userValidator.login,
    userController.login
)

module.exports = router;