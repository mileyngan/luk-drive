const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getUsers, createUser, updateUser } = require('../controllers/userController');

// Get users
router.get('/', authenticate, getUsers);

// Create user
router.post('/', authenticate, authorize(['admin', 'instructor']), createUser);

// Update user
router.put('/:userId', authenticate, authorize(['admin', 'instructor']), updateUser);

module.exports = router;