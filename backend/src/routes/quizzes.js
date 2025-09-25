const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getChapterQuiz, 
  submitQuiz 
} = require('../controllers/quizController');

// Get quiz for a chapter
router.get('/chapter/:chapterId', authenticate, authorize(['student']), getChapterQuiz);

// Submit quiz
router.post('/submit', authenticate, authorize(['student']), submitQuiz);

module.exports = router;