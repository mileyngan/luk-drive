const express = require('express');
const router = express.Router();
const { logIncident, validateAccess, getPiracyReports } = require('../controllers/piracyController');
const auth = require('../middleware/auth');

router.post('/log', auth, logIncident);
router.post('/validate-access', auth, validateAccess);
router.get('/reports', auth, getPiracyReports);

module.exports = router;
