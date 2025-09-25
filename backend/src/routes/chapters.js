const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getChapters, 
  createChapter, 
  updateChapter, 
  deleteChapter 
} = require('../controllers/chapterController');

// Get chapters
router.get('/', authenticate, getChapters);

// Create chapter
router.post('/', authenticate, authorize(['admin', 'instructor']), createChapter);

// Update chapter
router.put('/:chapterId', authenticate, authorize(['admin', 'instructor']), updateChapter);

// Delete chapter
router.delete('/:chapterId', authenticate, authorize(['admin', 'instructor']), deleteChapter);

module.exports = router;