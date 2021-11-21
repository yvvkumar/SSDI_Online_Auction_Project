// require modules
const express = require('express');
const controller = require('../controllers/mainController');

// create router
const router = express.Router();

// set up routes
router.get('/',controller.index);

router.get('/about',controller.about);

router.get('/contact',controller.contact);

// export
module.exports = router;