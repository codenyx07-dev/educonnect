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

const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs allowed'), false);
  }
});

// Create assignment (content system) with PDF upload support
router.post('/content', protect, authorize('mentor'), upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, subject, description, dueDate, questions, resourceType, resourceUrl } = req.body;
    const resourceFile = req.file ? req.file.path : req.body.resourceFile;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    // Try creating the assignment
    const assignment = await Assignment.create({
      title,
      subject,
      description,
      mentorId: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questions: typeof questions === 'string' ? JSON.parse(questions) : (questions || []),
      resourceType: resourceType || (req.file ? 'pdf' : 'text'),
      resourceUrl,
      resourceFile
    });

    // Strategy: Deploy to all students in role 'student'
    const students = await User.find({ role: 'student' });
    
    if (students.length > 0) {
      const submissions = students.map(s => ({
        studentId: s._id,
        assignmentId: assignment._id,
        status: 'pending'
      }));
      
      // Bulk insert submissions - if any fail, we still want the assignment to exist
      try {
        await Submission.insertMany(submissions, { ordered: false });
      } catch (insertError) {
        console.error('Partial Deploy Error:', insertError);
        // We continue because the assignment itself was created successfully
      }
    }

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error('Deployment Error:', error);
    res.status(500).json({ message: `Deployment Failed: ${error.message}` });
  }
});

module.exports = router;
