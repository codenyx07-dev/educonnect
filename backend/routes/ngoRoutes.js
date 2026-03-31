const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { addMentor, deleteMentor, getAllMentors } = require('../controllers/ngoController');
const { getNgoDashboardData, getNgoReports } = require('../controllers/dashboardController');

const router = express.Router();

// NGO Dashboard & Reports (Existing but moved for organization)
router.get('/dashboard', protect, authorize('ngo'), getNgoDashboardData);
router.get('/reports', protect, authorize('ngo'), getNgoReports);

// Mentor management
router.get('/mentors', protect, authorize('ngo'), getAllMentors);
router.post('/mentors', protect, authorize('ngo'), addMentor);
router.delete('/mentors/:id', protect, authorize('ngo'), deleteMentor);

module.exports = router;
