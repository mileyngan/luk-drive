const express = require('express');
const router = express.Router();
const { registerSchool, login } = require('../controllers/authController');

// Register school route
router.post('/register-school', registerSchool);

// Login route
router.post('/login', login);

module.exports = router;