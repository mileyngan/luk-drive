const piracyService = require('../services/piracyService');

const logIncident = async (req, res) => {
  try {
    const { chapterId, incidentType, details } = req.body;
    const { user_id, school_id } = req.user;

    await piracyService.logIncident(user_id, school_id, incidentType, details);

    // Generate alert if critical
    if (['camera_denied', 'multiple_devices', 'content_sharing'].includes(incidentType)) {
      await piracyService.generateAlert(school_id, 'piracy_alert',
        `Critical piracy incident: ${incidentType} for user ${user_id}`);
    }

    res.json({ success: true, message: 'Incident logged' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const validateAccess = async (req, res) => {
  try {
    const { chapterId, deviceFingerprint } = req.body;
    const { user_id, school_id } = req.user;

    const validation = await piracyService.validateAccess(user_id, chapterId, deviceFingerprint);

    if (!validation.valid) {
      await piracyService.logIncident(user_id, school_id, validation.reason, {
        chapterId,
        deviceFingerprint
      });
    }

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPiracyReports = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { startDate, endDate, incidentType } = req.query;

    let query = supabase
      .from('piracy_logs')
      .select('*')
      .eq('school_id', school_id)
      .order('timestamp', { ascending: false });

    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);
    if (incidentType) query = query.eq('incident_type', incidentType);

    const { data: reports, error } = await query;

    if (error) throw error;

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { logIncident, validateAccess, getPiracyReports };
