const { supabase } = require('../config/database');

// OLAP-style analytics for multi-dimensional data analysis
const getEnrollmentAnalytics = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { dimension = 'monthly', start_date, end_date } = req.query;

    // Get enrollment data with time dimensions
    const { data: enrollmentData, error } = await supabase
      .from('users')
      .select('created_at, role, gender, location')
      .eq('school_id', school_id)
      .eq('role', 'student')
      .gte('created_at', start_date || '2024-01-01')
      .lte('created_at', end_date || new Date().toISOString());

    if (error) throw error;

    // Process enrollment trends by dimension
    const trends = {};
    enrollmentData.forEach(user => {
      const date = new Date(user.created_at);
      let key;

      switch (dimension) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        default: // monthly
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      trends[key] = (trends[key] || 0) + 1;
    });

    // Demographics
    const demographics = {
      ageGroups: { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 },
      genderStats: { male: 0, female: 0, other: 0 },
      locationStats: {}
    };

    enrollmentData.forEach(user => {
      if (user.gender) {
        demographics.genderStats[user.gender.toLowerCase()] =
          (demographics.genderStats[user.gender.toLowerCase()] || 0) + 1;
      }
      if (user.location) {
        demographics.locationStats[user.location] =
          (demographics.locationStats[user.location] || 0) + 1;
      }
    });

    res.json({
      enrollmentTrends: Object.entries(trends).map(([period, count]) => ({ period, count })),
      demographics,
      totalEnrolled: enrollmentData.length
    });

  } catch (error) {
    console.error('Enrollment analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProgressAnalytics = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { dimension = 'chapter' } = req.query;

    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select(`
        *,
        student:users!student_id(first_name, last_name),
        chapter:chapters!chapter_id(title, subject, difficulty_level)
      `)
      .eq('chapter.school_id', school_id);

    if (error) throw error;

    // KPIs
    const totalStudents = new Set(progressData.map(p => p.student_id)).size;
    const avgScore = progressData.reduce((sum, p) => sum + p.quiz_score, 0) / progressData.length;
    const completionRate = (progressData.filter(p => p.completed_at).length / progressData.length) * 100;

    // Performance by dimensions
    const performanceByChapter = {};
    const performanceBySubject = {};
    const performanceByDifficulty = {};

    progressData.forEach(progress => {
      // By chapter
      const chapterKey = progress.chapter.title;
      if (!performanceByChapter[chapterKey]) {
        performanceByChapter[chapterKey] = { scores: [], completion: 0 };
      }
      performanceByChapter[chapterKey].scores.push(progress.quiz_score);
      if (progress.completed_at) performanceByChapter[chapterKey].completion++;

      // By subject
      const subjectKey = progress.chapter.subject;
      if (!performanceBySubject[subjectKey]) {
        performanceBySubject[subjectKey] = { scores: [], completion: 0 };
      }
      performanceBySubject[subjectKey].scores.push(progress.quiz_score);
      if (progress.completed_at) performanceBySubject[subjectKey].completion++;

      // By difficulty
      const difficultyKey = progress.chapter.difficulty_level;
      if (!performanceByDifficulty[difficultyKey]) {
        performanceByDifficulty[difficultyKey] = { scores: [], completion: 0 };
      }
      performanceByDifficulty[difficultyKey].scores.push(progress.quiz_score);
      if (progress.completed_at) performanceByDifficulty[difficultyKey].completion++;
    });

    // Calculate averages
    Object.keys(performanceByChapter).forEach(chapter => {
      const data = performanceByChapter[chapter];
      data.avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      data.completionRate = (data.completion / data.scores.length) * 100;
    });

    res.json({
      kpis: {
        totalStudents,
        avgScore: Math.round(avgScore * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        totalAttempts: progressData.length
      },
      performanceByChapter,
      performanceBySubject,
      performanceByDifficulty
    });

  } catch (error) {
    console.error('Progress analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const { school_id } = req.user;

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('school_id', school_id)
      .eq('payment_status', 'completed');

    if (error) throw error;

    // Revenue by type
    const revenueByType = {};
    payments.forEach(payment => {
      revenueByType[payment.payment_type] = (revenueByType[payment.payment_type] || 0) + payment.amount;
    });

    // Monthly trends
    const monthlyRevenue = {};
    payments.forEach(payment => {
      const month = new Date(payment.created_at).toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount;
    });

    res.json({
      revenueByType,
      monthlyTrends: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0)
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getPredictiveAnalytics = async (req, res) => {
  try {
    const { school_id } = req.user;

    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select(`
        student_id,
        quiz_score,
        completed_at,
        last_attempt_at,
        student:users!student_id(id, first_name, last_name, date_of_birth, last_login)
      `)
      .eq('chapter.school_id', school_id);

    if (error) throw error;

    // Simple dropout prediction
    const studentRisks = {};
    const now = new Date();

    progressData.forEach(progress => {
      const studentId = progress.student_id;
      if (!studentRisks[studentId]) {
        studentRisks[studentId] = {
          student: progress.student,
          scores: [],
          lastActivity: null,
          completionCount: 0,
          totalAttempts: 0
        };
      }

      const student = studentRisks[studentId];
      student.scores.push(progress.quiz_score);
      student.totalAttempts++;

      if (progress.completed_at) student.completionCount++;
      if (progress.last_attempt_at) {
        const lastActivity = new Date(progress.last_attempt_at);
        if (!student.lastActivity || lastActivity > student.lastActivity) {
          student.lastActivity = lastActivity;
        }
      }
    });

    // Calculate risk scores
    Object.values(studentRisks).forEach(student => {
      const avgScore = student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
      const completionRate = student.completionCount / student.totalAttempts;
      const daysSinceActivity = student.lastActivity ?
        Math.floor((now - student.lastActivity) / (1000 * 60 * 60 * 24)) : 30;

      let riskScore = 0;
      if (avgScore < 50) riskScore += 40;
      if (completionRate < 0.3) riskScore += 30;
      if (daysSinceActivity > 14) riskScore += 20;

      student.riskScore = Math.min(riskScore, 100);
      student.riskLevel = student.riskScore >= 70 ? 'high' : student.riskScore >= 40 ? 'medium' : 'low';
    });

    const atRiskStudents = Object.values(studentRisks)
      .filter(s => s.riskLevel !== 'low')
      .sort((a, b) => b.riskScore - a.riskScore);

    res.json({
      dropoutPrediction: {
        atRiskStudents: atRiskStudents.slice(0, 10),
        riskDistribution: {
          high: Object.values(studentRisks).filter(s => s.riskLevel === 'high').length,
          medium: Object.values(studentRisks).filter(s => s.riskLevel === 'medium').length,
          low: Object.values(studentRisks).filter(s => s.riskLevel === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

const exportAnalyticsReport = async (req, res) => {
  try {
    const { report_type } = req.params;
    const { school_id } = req.user;

    let reportData = {};

    switch (report_type) {
      case 'enrollment':
        const enrollment = await getEnrollmentAnalytics({ user: req.user, query: {} }, { json: (data) => data });
        reportData = enrollment;
        break;
      case 'progress':
        const progress = await getProgressAnalytics({ user: req.user, query: {} }, { json: (data) => data });
        reportData = progress;
        break;
      case 'revenue':
        const revenue = await getRevenueAnalytics({ user: req.user, query: {} }, { json: (data) => data });
        reportData = revenue;
        break;
      default:
        throw new Error('Invalid report type');
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report_type}_report_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(reportData);

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEnrollmentAnalytics,
  getProgressAnalytics,
  getRevenueAnalytics,
  getPredictiveAnalytics,
  exportAnalyticsReport
};
