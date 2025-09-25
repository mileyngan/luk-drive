// ============ src/routes/schools.js ============
const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all schools (Super Admin only)
router.get('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { data: schools, error } = await supabase
      .from('schools')
      .select(`
        *,
        users:users(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ schools });

  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Approve/Reject school (Super Admin only)
router.put('/:schoolId/status', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status } = req.body;

    if (!['approved', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: school, error } = await supabase
      .from('schools')
      .update({ status, updated_at: new Date() })
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ 
      message: `School ${status} successfully`,
      school 
    });

  } catch (error) {
    console.error('Update school status error:', error);
    res.status(500).json({ error: 'Failed to update school status' });
  }
});

// Get school stats (Admin)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    // Get user counts by role
    const { data: userStats, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('school_id', schoolId);

    if (userError) {
      throw userError;
    }

    const stats = {
      totalStudents: userStats.filter(u => u.role === 'student').length,
      totalInstructors: userStats.filter(u => u.role === 'instructor').length,
      totalUsers: userStats.length
    };

    // Get chapter counts
    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    stats.totalChapters = totalChapters;

    res.json({ stats });

  } catch (error) {
    console.error('Get school stats error:', error);
    res.status(500).json({ error: 'Failed to fetch school stats' });
  }
});

module.exports = router;