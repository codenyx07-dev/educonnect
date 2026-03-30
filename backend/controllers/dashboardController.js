const RiskScore = require('../models/RiskScore');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const Badge = require('../models/Badge');

// NGO Dashboard — real MongoDB aggregation
exports.getNgoDashboardData = async (req, res) => {
  try {
    const totalImpacted = await RiskScore.countDocuments();
    const criticalZonesCount = await RiskScore.countDocuments({ riskLevel: 'Critical' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });

    // Aggregate area heatmap data
    const heatmapAggregation = await RiskScore.aggregate([
      {
        $group: {
          _id: "$village",
          averageRisk: { $avg: "$score" },
          totalStudents: { $sum: 1 },
          criticalStudents: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "Critical"] }, 1, 0] }
          },
          safeStudents: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "Safe"] }, 1, 0] }
          }
        }
      }
    ]);

    const heatmap = heatmapAggregation.map(zone => ({
      village: zone._id,
      averageRiskScore: Math.round(zone.averageRisk),
      totalStudents: zone.totalStudents,
      criticalPercentage: Math.round((zone.criticalStudents / zone.totalStudents) * 100),
      safePercentage: Math.round((zone.safeStudents / zone.totalStudents) * 100)
    }));

    res.json({
      totalImpacted,
      criticalZonesCount,
      totalMentors,
      heatmap
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mentor Dashboard — live stats
exports.getMentorDashboardData = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Get all students (in a real app, filter by assigned mentor)
    const students = await User.find({ role: 'student' });
    const studentIds = students.map(s => s._id);

    // Get risk scores for students
    const riskScores = await RiskScore.find({ studentId: { $in: studentIds } }).populate('studentId', 'name email');

    const atRiskStudents = riskScores.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'Moderate');

    // Get assignment stats
    const assignments = await Assignment.countDocuments({ mentorId });
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });

    res.json({
      totalStudents: students.length,
      atRiskCount: atRiskStudents.length,
      pendingDoubts: Math.min(pendingSubmissions, 8), // cap for UI
      assignmentCount: assignments,
      atRiskStudents: atRiskStudents.slice(0, 5).map(r => ({
        name: r.studentId?.name || 'Unknown',
        risk: r.riskLevel,
        score: r.score,
        reason: r.score >= 70 ? 'Multiple risk factors detected' :
                r.factors.missedAssignments > 0.5 ? 'Missed multiple assignments' :
                r.factors.lowAttendance > 0.5 ? 'Low attendance pattern' :
                'Declining academic scores'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student Dashboard — personalized data
exports.getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get progress data
    const progress = await Progress.find({ studentId });

    // Build weekly chart data from most recent progress entry
    let weeklyScores = [];
    if (progress.length > 0) {
      const latest = progress[0];
      weeklyScores = latest.weeklyScores.slice(-7).map((w, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
        score: w.score
      }));
    }

    // Get badge count for XP
    const badges = await Badge.find({ studentId, unlocked: true });
    const totalXP = badges.reduce((sum, b) => sum + b.xpValue, 0);

    // Get pending assignments
    const submissions = await Submission.find({ studentId, status: 'pending' }).populate('assignmentId');
    const pendingCount = submissions.length;

    // Get risk score
    const riskScore = await RiskScore.findOne({ studentId });

    // Calculate streak (simplified — based on consecutive days with activity)
    const streak = Math.floor(Math.random() * 7) + 1; // TODO: calculate from real activity log

    res.json({
      weeklyScores,
      totalXP,
      level: Math.floor(totalXP / 500) + 1,
      streak,
      pendingAssignments: pendingCount,
      riskLevel: riskScore?.riskLevel || 'Safe',
      overallScore: progress[0]?.overallScore || 0,
      dailyGoals: [
        { label: 'Complete Math Quiz', done: pendingCount === 0 },
        { label: 'Read Science Chapter', done: false },
        { label: 'Practice English Vocab', done: false }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NGO Reports — detailed zone data
exports.getNgoReports = async (req, res) => {
  try {
    const reports = await RiskScore.aggregate([
      {
        $group: {
          _id: "$village",
          totalStudents: { $sum: 1 },
          avgRisk: { $avg: "$score" },
          criticalCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "Critical"] }, 1, 0] }
          },
          safeCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "Safe"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get mentor count (simplified — in production would be per-region)
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const mentorsPerRegion = Math.ceil(totalMentors / Math.max(reports.length, 1));

    const formatted = reports.map(r => {
      const avgRiskPct = Math.round(r.avgRisk);
      let trend = 'Stable';
      if (avgRiskPct > 60) trend = 'Critical';
      else if (avgRiskPct > 45) trend = 'Declining';
      else if (avgRiskPct < 30) trend = 'Improving';

      return {
        region: r._id,
        students: r.totalStudents,
        mentors: mentorsPerRegion,
        avgRisk: `${avgRiskPct}%`,
        trend
      };
    });

    res.json({ reports: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
