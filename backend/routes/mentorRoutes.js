const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { matchMentor, getMentorStudents } = require('../controllers/matchingController');
const { getMentorDashboardData } = require('../controllers/dashboardController');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const router = express.Router();

// Mentor dashboard
router.get('/dashboard', protect, authorize('mentor'), getMentorDashboardData);

// Match a mentor (called by students, but needs auth)
router.post('/match', protect, matchMentor);

// Get mentor's students list with risk data
router.get('/students', protect, authorize('mentor'), getMentorStudents);

// Create assignment (content system)
router.post('/content', protect, authorize('mentor'), async (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      mentorId: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // default 1 week
    });

    // Auto-create pending submissions for all students
    const students = await User.find({ role: 'student' });
    const submissions = students.map(s => ({
      studentId: s._id,
      assignmentId: assignment._id,
      status: 'pending'
    }));
    await Submission.insertMany(submissions);

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
