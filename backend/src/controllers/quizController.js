const { supabase } = require('../config/database');

const getChapterQuiz = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Get chapter
    const {  chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (chapterError) throw chapterError;

    // Get quiz questions for this chapter
    const {  questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('chapter_id', chapterId);

    if (questionsError) throw questionsError;

    res.json({ chapter, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { student_id } = req.user;
    const { chapter_id, answers } = req.body;

    // Get chapter questions to verify answers
    const {  questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('chapter_id', chapter_id);

    if (questionsError) throw questionsError;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);

    // Update or create student progress
    const {  progress, error: progressError } = await supabase
      .from('student_progress')
      .upsert({
        student_id,
        chapter_id,
        quiz_score: score,
        quiz_attempts: 1,
        completed_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString()
      }, {
        onConflict: ['student_id', 'chapter_id']
      })
      .select()
      .single();

    if (progressError) throw progressError;

    res.json({ 
      message: 'Quiz submitted successfully', 
      score, 
      total: questions.length, 
      correct: correctAnswers 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChapterQuiz, submitQuiz };