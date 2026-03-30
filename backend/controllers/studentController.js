const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const Badge = require('../models/Badge');
const RiskScore = require('../models/RiskScore');

// Get student's assignments with submission status
exports.getAssignments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const assignments = await Assignment.find({}).sort({ createdAt: -1 });

    // Get submissions for this student
    const submissions = await Submission.find({ studentId });
    const submissionMap = {};
    submissions.forEach(s => {
      submissionMap[s.assignmentId.toString()] = s;
    });

    const result = assignments.map(a => ({
      id: a._id,
      title: a.title,
      subject: a.subject,
      description: a.description || '',
      dueDate: a.dueDate,
      status: submissionMap[a._id.toString()]?.status || 'pending',
      due: a.dueDate ? formatDueDate(a.dueDate) : 'No deadline'
    }));

    res.json({ assignments: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single assignment with questions
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    // Check if user already submitted
    const submission = await Submission.findOne({ studentId: req.user._id, assignmentId: req.params.id });
    
    res.json({ 
      assignment, 
      isSubmitted: submission?.status === 'submitted' || submission?.status === 'graded' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit an assignment with grading
exports.submitAssignment = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { id } = req.params;
    const { answers } = req.body; // Array of option indices

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Calculate score
    let correctCount = 0;
    if (assignment.questions && assignment.questions.length > 0) {
      assignment.questions.forEach((q, idx) => {
        if (answers && answers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
    }
    const score = Math.round((correctCount / (assignment.questions?.length || 1)) * 100);

    // Create or update submission
    let submission = await Submission.findOne({ studentId, assignmentId: id });
    const isNew = !submission;

    if (submission) {
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      submission.score = score;
      submission.grade = score;
      submission.answers = answers;
      await submission.save();
    } else {
      submission = await Submission.create({
        studentId,
        assignmentId: id,
        status: 'submitted',
        submittedAt: new Date(),
        score,
        grade: score,
        answers
      });
    }

    // Update Progress (Dashboard Impact)
    let progress = await Progress.findOne({ studentId, subject: assignment.subject });
    if (!progress) {
      progress = await Progress.create({
        studentId,
        subject: assignment.subject,
        weeklyScores: [{ day: new Date().toLocaleDateString('en-US', { weekday: 'short' }), score }]
      });
    } else {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      const dayIdx = progress.weeklyScores.findIndex(d => d.day === today);
      if (dayIdx > -1) {
        progress.weeklyScores[dayIdx].score = Math.round((progress.weeklyScores[dayIdx].score + score) / 2);
      } else {
        progress.weeklyScores.push({ day: today, score });
      }
      await progress.save();
    }

    // Update RiskScore
    const risk = await RiskScore.findOne({ studentId });
    if (risk) {
      // Logic to reduce risk if score is high
      if (score > 80) risk.factors.lowScores = Math.max(0, risk.factors.lowScores - 5);
      else if (score < 40) risk.factors.lowScores += 10;
      await risk.save();
    }

    // Award Badge for first high score
    if (score >= 90) {
      const existingBadge = await Badge.findOne({ studentId, title: `${assignment.subject} Master` });
      if (!existingBadge) {
        await Badge.create({
          studentId,
          title: `${assignment.subject} Master`,
          description: `Completed a ${assignment.subject} task with 90%+ score!`,
          icon: 'Star',
          xpValue: 100,
          unlockedAt: new Date()
        });
      }
    }

    res.json({ success: true, submission, score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student badges
exports.getBadges = async (req, res) => {
  try {
    const studentId = req.user._id;
    const badges = await Badge.find({ studentId }).sort({ unlockedAt: -1 });
    const totalXP = badges.reduce((sum, b) => sum + b.xpValue, 0);
    const level = Math.floor(totalXP / 500) + 1;

    res.json({ badges, totalXP, level });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student progress (weekly scores for chart)
exports.getProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const progress = await Progress.find({ studentId });

    const subjects = progress.map(p => ({
      subject: p.subject,
      overallScore: p.overallScore,
      confidenceScore: p.confidenceScore,
      topicMastery: p.topicMastery ? Object.fromEntries(p.topicMastery) : {},
      weeklyScores: p.weeklyScores
    }));

    res.json({ progress: subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get individual student risk/heatmap data
exports.getRiskData = async (req, res) => {
  try {
    const studentId = req.user._id;
    const riskScore = await RiskScore.findOne({ studentId });

    if (!riskScore) {
      return res.json({
        score: 0,
        riskLevel: 'Safe',
        factors: { lowScores: 0, missedAssignments: 0, lowAttendance: 0, slowProgress: 0 }
      });
    }

    res.json({
      score: riskScore.score,
      riskLevel: riskScore.riskLevel,
      factors: riskScore.factors,
      village: riskScore.village
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: format due date relative to now
function formatDueDate(date) {
  const now = new Date();
  const due = new Date(date);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return `${due.toLocaleDateString()}`;
}
