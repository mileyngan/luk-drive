const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getUsers, createUser, updateUser } = require('../controllers/userController');

// Get users (only users from the same school)
router.get('/', authenticate, getUsers);

// Create user (admin/instructor only, will be created under their school)
router.post('/', authenticate, authorize(['admin', 'instructor']), createUser);

// Update user (admin/instructor only)
router.put('/:userId', authenticate, authorize(['admin', 'instructor']), updateUser);

module.exports = router;