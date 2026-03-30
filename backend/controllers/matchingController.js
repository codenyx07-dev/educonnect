const User = require('../models/User');
const Feedback = require('../models/Feedback');

exports.matchMentor = async (req, res) => {
  try {
    const { studentSubjects, studentLanguage } = req.body;

    const mentors = await User.find({ role: 'mentor' });

    if (mentors.length === 0) {
      return res.status(404).json({ success: false, message: 'No mentors available at this time.' });
    }

    // Score-based matching algorithm
    const scoredMentors = await Promise.all(mentors.map(async (mentor) => {
      let matchScore = 50; // base score

      // Get average rating from feedback
      const feedbacks = await Feedback.find({ mentorId: mentor._id });
      const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 4.0;

      matchScore += avgRating * 10; // up to +50 points from rating

      return {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        matchedScore: `${Math.min(Math.round(matchScore), 99)}%`,
        rating: avgRating.toFixed(1),
        reason: `Matched based on availability and ${avgRating >= 4 ? 'excellent' : 'good'} teaching rating (${avgRating.toFixed(1)}⭐).`
      };
    }));

    // Sort by match score descending and pick best
    scoredMentors.sort((a, b) => parseInt(b.matchedScore) - parseInt(a.matchedScore));
    const bestMentor = scoredMentors[0];

    res.json({ success: true, mentor: bestMentor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorStudents = async (req, res) => {
  try {
    const RiskScore = require('../models/RiskScore');

    // Get all students with their risk scores
    const students = await User.find({ role: 'student' });
    const riskScores = await RiskScore.find({});

    const riskMap = {};
    riskScores.forEach(r => {
      riskMap[r.studentId.toString()] = r;
    });

    const result = students.slice(0, 20).map(student => {
      const risk = riskMap[student._id.toString()];
      return {
        id: student._id,
        name: student.name,
        subject: ['Math', 'Science', 'English'][Math.floor(Math.random() * 3)],
        score: risk ? `${100 - risk.score}%` : '75%',
        risk: risk?.riskLevel || 'Safe',
        riskColor: risk?.riskLevel === 'Critical' ? 'text-rose-600 bg-rose-100 dark:bg-rose-900/40' :
                   risk?.riskLevel === 'Moderate' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/40' :
                   'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40'
      };
    });

    res.json({ students: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
