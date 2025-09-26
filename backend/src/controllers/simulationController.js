const { supabase } = require('../config/database');

const getCarSimulations = async (req, res) => {
  try {
    const {  simulations, error } = await supabase
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

    const {  studentSims, error } = await supabase
      .from('student_simulations')
      .select(`
        *,
        simulation:car_simulations(title, description, difficulty_level)
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
    const { simulation_id, chapter_id } = req.body;

    const {  result, error } = await supabase
      .from('student_simulations')
      .insert([{
        student_id: user_id,
        simulation_id,
        chapter_id,
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeSimulation = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { simulation_id, score, completion_time, completed_at } = req.body;

    const {  result, error } = await supabase
      .from('student_simulations')
      .update({
        score,
        completion_time,
        completed_at,
        is_completed: true
      })
      .eq('student_id', user_id)
      .eq('simulation_id', simulation_id)
      .select()
      .single();

    if (error) throw error;

    // Update student progress with simulation score
    const {  progress, error: progressError } = await supabase
      .from('student_progress')
      .upsert({
        student_id: user_id,
        chapter_id: result.chapter_id,
        simulation_score: score,
        // Calculate overall readiness (this is a simplified calculation)
        overall_readiness_percentage: Math.min(100, (score * 0.3)) // 30% from simulation
      }, {
        onConflict: ['student_id', 'chapter_id']
      })
      .select()
      .single();

    if (progressError) throw progressError;

    res.json({ ...result, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getCarSimulations, 
  getStudentSimulations, 
  startSimulation, 
  completeSimulation 
};