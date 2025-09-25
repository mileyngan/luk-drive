const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { sendMessage } = require('../controllers/chatController');

// Send message to AI
router.post('/', authenticate, authorize(['student']), sendMessage);

module.exports = router;