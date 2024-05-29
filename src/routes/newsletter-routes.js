const { Router } = require('express');
const verifyAPIKey = require('../middlewares/verifyAPIKey');

const newsletterController = require('../controller/newsletter-controller.js');
const newsletterValidator = require('../middlewares/objects-validators/newsletter-validator.js');

const router = Router();

router.post(
    '/create/',
    verifyAPIKey,
    newsletterValidator.create,
    newsletterController.create
);
router.delete(
    '/delete/:email',
    verifyAPIKey,
    newsletterValidator.deleteEmail,
    newsletterController.deleteEmail
);

module.exports = router;