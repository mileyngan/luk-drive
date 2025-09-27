const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Analytics routes with role-based access
router.get('/enrollment', authenticate, authorize(['admin', 'instructor']), analyticsController.getEnrollmentAnalytics);
router.get('/progress', authenticate, authorize(['admin', 'instructor']), analyticsController.getProgressAnalytics);
router.get('/revenue', authenticate, authorize(['admin', 'super_admin']), analyticsController.getRevenueAnalytics);
router.get('/predictive', authenticate, authorize(['admin', 'instructor']), analyticsController.getPredictiveAnalytics);
router.get('/export/:report_type', authenticate, authorize(['admin', 'super_admin']), analyticsController.exportAnalyticsReport);

// OLAP-style multi-dimensional queries
router.get('/olap/enrollment/:dimension', authenticate, authorize(['admin']), analyticsController.getEnrollmentAnalytics);
router.get('/olap/progress/:dimension', authenticate, authorize(['admin', 'instructor']), analyticsController.getProgressAnalytics);
router.get('/olap/revenue/:dimension', authenticate, authorize(['admin', 'super_admin']), analyticsController.getRevenueAnalytics);

// Real-time analytics (WebSocket ready)
router.get('/realtime/metrics', authenticate, authorize(['admin']), (req, res) => {
  // Placeholder for real-time metrics via WebSocket
  res.json({ message: 'Real-time metrics endpoint ready for WebSocket integration' });
});

// Advanced reporting
router.post('/reports/custom', authenticate, authorize(['admin']), (req, res) => {
  // Custom report generation with user-defined dimensions and measures
  const { dimensions, measures, filters } = req.body;
  // Implementation for custom OLAP reports
  res.json({ 
    message: 'Custom OLAP report generated',
    dimensions,
    measures,
    filters,
    status: 'processing' // Would trigger async report generation
  });
});

module.exports = router;