const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterContent,
  validateChapterAccess
} = require('../controllers/chapterController');

// Get chapters (any authenticated user can view their school's chapters)
router.get('/', authenticate, getChapters);

// Create chapter (admin/instructor only)
router.post('/', authenticate, authorize(['admin', 'instructor']), createChapter);

// Update chapter (admin/instructor only)
router.put('/:chapterId', authenticate, authorize(['admin', 'instructor']), updateChapter);

// Delete chapter (admin/instructor only)
router.delete('/:chapterId', authenticate, authorize(['admin', 'instructor']), deleteChapter);

// Get encrypted chapter content (students only)
router.get('/:chapterId/content', authenticate, authorize(['student']), getChapterContent);

// Validate chapter access (students only)
router.post('/validate-access', authenticate, authorize(['student']), validateChapterAccess);

module.exports = router;
