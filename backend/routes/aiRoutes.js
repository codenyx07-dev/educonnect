const express = require('express');
const { chatWithAI, generateQuestions, analyzePerformance } = require('../controllers/aiController');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAI);
router.post('/generate-questions', protect, authorize('mentor'), generateQuestions);
router.post('/analyze-performance', protect, analyzePerformance);

module.exports = router;
