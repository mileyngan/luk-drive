const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getAllSchools, 
  updateSchoolStatus, 
  getSchoolStats 
} = require('../controllers/schoolController');

// Get all schools (super admin only)
router.get('/', authenticate, authorize(['super_admin']), getAllSchools);

// Update school status (super admin only)
router.put('/status', authenticate, authorize(['super_admin']), updateSchoolStatus);

// Get school stats (school admin only)
router.get('/stats', authenticate, getSchoolStats);

module.exports = router;