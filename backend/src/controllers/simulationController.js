const { supabase } = require('../config/database');

const getCarSimulations = async (req, res) => {
  try {
    const { simulations, error } = await supabase
      .from('car_simulations')
      .select(`
        *,
        chapter:chapters(title)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentSimulations = async (req, res) => {
  try {
    const { user_id } = req.user;

    const { studentSims, error } = await supabase
      .from('student_simulations')
      .select(`
        *,
        simulation:car_simulations(title, description, difficulty_level, type),
        scenarios:simulation_scenarios(*)
      `)
      .eq('student_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(studentSims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const startSimulation = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { scenario_id, chapter_id } = req.body;

    // Create simulation session
    const { result: session, error: sessionError } = await supabase
      .from('student_simulations')
      .insert([{
        student_id: user_id,
        scenario_id,
        chapter_id,
        started_at: new Date().toISOString(),
        is_completed: false,
        score: 0
      }])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Get scenario details
    const { data: scenario, error: scenarioError } = await supabase
      .from('simulation_scenarios')
      .select('*')
      .eq('id', scenario_id)
      .single();

    if (scenarioError) throw scenarioError;

    res.json({
      session,
      scenario,
      message: 'Simulation started successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeSimulation = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { scenario_id, score, completion_time, feedback_count, completed_at } = req.body;

    // Update simulation session
    const { result: updatedSession, error: updateError } = await supabase
      .from('student_simulations')
      .update({
        score,
        completion_time,
        feedback_count,
        completed_at,
        is_completed: true
      })
      .eq('student_id', user_id)
      .eq('scenario_id', scenario_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Get chapter_id from scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from('simulation_scenarios')
      .select('chapter_id')
      .eq('id', scenario_id)
      .single();

    if (scenarioError) throw scenarioError;

    // Enhanced readiness calculation
    const readinessData = calculateReadinessScore(score, feedback_count, completion_time, updatedSession);

    // Update student progress
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .upsert({
        student_id: user_id,
        chapter_id: scenario.chapter_id,
        simulation_score: score,
        readiness_percentage: readinessData.readiness,
        performance_metrics: {
          feedback_count,
          completion_time,
          scenarios_completed: 1 // Can be enhanced for multiple scenarios
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: ['student_id', 'chapter_id']
      })
      .select()
      .single();

    if (progressError) throw progressError;

    // Log performance analytics
    await logPerformanceAnalytics(user_id, scenario.chapter_id, readinessData);

    res.json({ 
      session: updatedSession, 
      progress,
      analytics: readinessData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateReadinessScore = (score, feedbackCount, completionTime, session) => {
  let readiness = score * 0.4; // Base score contribution

  // Feedback quality (more positive feedback = higher readiness)
  const positiveFeedbackRatio = Math.min(1, feedbackCount / 5); // Assume max 5 feedback events
  readiness += positiveFeedbackRatio * 20;

  // Time efficiency (faster completion = better)
  const expectedTime = session.scenario_duration || 180; // Default 3 minutes
  const timeEfficiency = Math.max(0, 1 - (completionTime / expectedTime));
  readiness += timeEfficiency * 15;

  // Consistency bonus (if student has previous good scores)
  // This would require querying previous simulations - simplified here
  readiness += 10; // Base consistency

  // Difficulty multiplier
  const difficultyMultiplier = session.difficulty === 'advanced' ? 1.2 : 
                             session.difficulty === 'intermediate' ? 1.1 : 1.0;
  readiness *= difficultyMultiplier;

  readiness = Math.max(0, Math.min(100, readiness));

  return {
    readiness: Math.round(readiness),
    breakdown: {
      base_score: score * 0.4,
      feedback_quality: positiveFeedbackRatio * 20,
      time_efficiency: timeEfficiency * 15,
      consistency: 10,
      difficulty_multiplier: difficultyMultiplier
    }
  };
};

const logPerformanceAnalytics = async (studentId, chapterId, readinessData) => {
  try {
    await supabase
      .from('simulation_analytics')
      .insert([{
        student_id: studentId,
        chapter_id: chapterId,
        readiness_score: readinessData.readiness,
        performance_data: readinessData.breakdown,
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log performance analytics:', error);
  }
};

const getReadinessAnalytics = async (req, res) => {
  try {
    const { user_id } = req.user;

    const { data: analytics, error } = await supabase
      .from('simulation_analytics')
      .select(`
        *,
        chapter:chapters(title),
        student:users(full_name)
      `)
      .eq('student_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate overall readiness trend
    const totalReadiness = analytics.reduce((sum, item) => sum + item.readiness_score, 0);
    const averageReadiness = analytics.length > 0 ? totalReadiness / analytics.length : 0;

    res.json({
      analytics,
      summary: {
        average_readiness: Math.round(averageReadiness),
        total_sessions: analytics.length,
        recent_trend: analytics.length > 0 ? analytics[0].readiness_score : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getCarSimulations, 
  getStudentSimulations, 
  startSimulation, 
  completeSimulation,
  getReadinessAnalytics
};
