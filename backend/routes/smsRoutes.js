const express = require('express');
const router = express.Router();
const { sendTextMessage, receiveSMS } = require('../controllers/smsController');

router.post('/send', sendTextMessage);
router.post('/receive', receiveSMS);

module.exports = router;
