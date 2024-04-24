const { Router } = require('express');
const verifyAPIKey = require('../middlewares/verifyAPIKey');

const genderController = require('../controller/gender-controller');

const router = Router();

router.get(
    '/',
    verifyAPIKey,
    genderController.getAll
)

module.exports = router;