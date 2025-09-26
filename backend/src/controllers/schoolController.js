const { supabase } = require('../config/database');

const getAllSchools = async (req, res) => {
  try {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSchoolStatus = async (req, res) => {
  try {
    const { schoolId, status } = req.body;

    const { data: school, error } = await supabase
      .from('schools')
      .update({ status })
      .eq('id', schoolId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'School status updated', school });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSchoolStats = async (req, res) => {
  try {
    const { school_id } = req.user;

    // Get school users count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('school_id', school_id);

    // Get chapters count
    const { count: chapterCount } = await supabase
      .from('chapters')
      .select('*', { count: 'exact' })
      .eq('school_id', school_id);

    // Get student progress
    const { data: progressData } = await supabase
      .from('student_progress')
      .select(`
        *,
        student:users!student_id(first_name, last_name),
        chapter:chapters!chapter_id(title)
      `)
      .eq('chapter.school_id', school_id);

    res.json({
      stats: {
        totalUsers: userCount,
        totalChapters: chapterCount,
        totalProgress: progressData?.length || 0
      },
      recentProgress: progressData?.slice(0, 10) || []
    });

  } catch (error) {
    console.error('School stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllSchools, updateSchoolStatus, getSchoolStats };