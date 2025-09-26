const { supabase } = require('../config/database');

const getChapterQuiz = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Get quiz questions for chapter
    const {  questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('chapter_id', chapterId);

    if (error) throw error;

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { student_id } = req.user;
    const { chapter_id, answers } = req.body;

    // Calculate score logic
    // Update progress in database
    res.json({ message: 'Quiz submitted', score: 85 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChapterQuiz, submitQuiz };