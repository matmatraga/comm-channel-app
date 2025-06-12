const express = require('express');
const router = express.Router();
const { downloadAttachment } = require('../controllers/attachmentController');

router.get('/:filename', downloadAttachment);

module.exports = router;