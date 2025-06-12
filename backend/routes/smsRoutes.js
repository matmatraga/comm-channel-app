const express = require('express');
const router = express.Router();
const { sendTextMessage, receiveSMS, getSMSHistory } = require('../controllers/smsController');

router.post('/send', sendTextMessage);
router.post('/receive', receiveSMS);
router.get('/history', getSMSHistory);

module.exports = router;
