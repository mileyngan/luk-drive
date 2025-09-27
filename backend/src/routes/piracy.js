const express = require('express');
const router = express.Router();
const piracyController = require('../controllers/piracyController');
const { authenticate } = require('../middleware/auth');

router.post('/log', authenticate, piracyController.logIncident);
router.post('/validate-access', authenticate, piracyController.validateAccess);
router.get('/reports', authenticate, piracyController.getPiracyReports);

module.exports = router;