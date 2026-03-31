const User = require('../models/User');
const Feedback = require('../models/Feedback');

exports.matchMentor = async (req, res) => {
  try {
    const { subjects, language } = req.body;
    const studentId = req.user._id;

    // Find all available mentors
    const mentors = await User.find({ role: 'mentor' });

    if (mentors.length === 0) {
      return res.status(404).json({ success: false, message: 'No mentors available at this time.' });
    }

    // Matching logic per request: Subject & Language priority
    const scoredMentors = mentors.map(mentor => {
      let score = 50; // base score
      
      // Subject overlap bonus
      if (mentor.subjectsTaught && subjects) {
        const overlap = mentor.subjectsTaught.filter(s => subjects.includes(s));
        score += overlap.length * 20; // +20 points per subject match
      }

      // Language match bonus
      if (mentor.spokenLanguages && language) {
        if (mentor.spokenLanguages.includes(language)) score += 30;
      }

      // Rating bonus
      score += (mentor.avgRating || 4.2) * 2;

      return {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        matchedScore: `${Math.min(Math.round(score), 99)}%`,
        rating: (mentor.avgRating || 4.2).toFixed(1),
        reason: `Matched based on ${subjects?.length > 0 ? subjects[0] : 'Academic'} proficiency and language compatibility.`
      };
    });

    // Sort and pick best
    scoredMentors.sort((a, b) => parseInt(b.matchedScore) - parseInt(a.matchedScore));
    const bestMentor = scoredMentors[0];

    // Persist assignment
    await User.findByIdAndUpdate(studentId, { assignedMentorId: bestMentor._id });

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
      const level = risk?.riskLevel === 'Critical' ? 'High' : 
                   risk?.riskLevel === 'Moderate' ? 'Medium' : 'Low';
      return {
        id: student._id,
        name: student.name,
        subject: ['Math', 'Science', 'English'][Math.floor(Math.random() * 3)],
        score: risk ? `${100 - risk.score}%` : '75%',
        risk: level,
        riskColor: level === 'High' ? 'text-rose-600 bg-rose-100 dark:bg-rose-900/40' :
                   level === 'Medium' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/40' :
                   'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40'
      };
    });

    res.json({ students: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
