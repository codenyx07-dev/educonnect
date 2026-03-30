const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getNgoDashboardData, getNgoReports } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/ngo', protect, authorize('ngo'), getNgoDashboardData);
router.get('/ngo/reports', protect, authorize('ngo'), getNgoReports);

module.exports = router;
