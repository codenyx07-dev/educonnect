const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAssignments, submitAssignment, getBadges, getProgress, getRiskData } = require('../controllers/studentController');
const { getStudentDashboardData } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getStudentDashboardData);
router.get('/progress', protect, authorize('student'), getProgress);
router.get('/assignments', protect, authorize('student'), getAssignments);
router.get('/assignments/:id', protect, authorize('student'), require('../controllers/studentController').getAssignmentById);
router.post('/assignments/:id/submit', protect, authorize('student'), submitAssignment);
router.get('/badges', protect, authorize('student'), getBadges);
router.get('/risk', protect, authorize('student'), getRiskData);

module.exports = router;
