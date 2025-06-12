const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

router.post('/call', voiceController.makeCall);
router.post('/voice-response', express.urlencoded({ extended: false }), voiceController.voiceWebhook);
router.get('/history', voiceController.getCallHistory);
// routes/voiceRoutes.js
router.get('/token', voiceController.generateToken);


module.exports = router;