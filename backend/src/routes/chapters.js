const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getChapters, 
  createChapter, 
  updateChapter, 
  deleteChapter 
} = require('../controllers/chapterController');

// Get chapters (any authenticated user can view their school's chapters)
router.get('/', authenticate, getChapters);

// Create chapter (admin/instructor only)
router.post('/', authenticate, authorize(['admin', 'instructor']), createChapter);

// Update chapter (admin/instructor only)
router.put('/:chapterId', authenticate, authorize(['admin', 'instructor']), updateChapter);

// Delete chapter (admin/instructor only)
router.delete('/:chapterId', authenticate, authorize(['admin', 'instructor']), deleteChapter);

module.exports = router;