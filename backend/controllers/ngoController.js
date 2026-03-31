const User = require('../models/User');

// Add a new mentor
exports.addMentor = async (req, res) => {
  try {
    const { name, email, password, subjectsTaught, spokenLanguages } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const mentor = await User.create({
      name,
      email,
      password,
      role: 'mentor',
      subjectsTaught,
      spokenLanguages
    });

    res.status(201).json({
      success: true,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a mentor
exports.deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await User.findById(id);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Unassign students before deleting (Set assignedMentorId to null)
    await User.updateMany({ assignedMentorId: id }, { assignedMentorId: null });

    await User.findByIdAndDelete(id);

    res.json({ success: true, message: 'Mentor deleted and students unassigned.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all mentors for the NGO dashboard
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' });
    
    // Enrich with student count
    const enrichedMentors = await Promise.all(mentors.map(async (m) => {
      const studentCount = await User.countDocuments({ assignedMentorId: m._id });
      return {
        _id: m._id,
        name: m.name,
        email: m.email,
        avgRating: m.avgRating,
        feedbackCount: m.feedbackCount,
        studentCount,
        subjects: m.subjectsTaught
      };
    }));

    res.json({ mentors: enrichedMentors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
