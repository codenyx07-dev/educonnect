const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const router = express.Router();

// Get chat history for a specific room
router.get('/history/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Authorization check: User must be part of this room
    // Room format: room_{STUDENT_ID}_mentor_{MENTOR_ID}
    const parts = roomId.split('_');
    const studentId = parts[1];
    const mentorId = parts[3];
    
    if (req.user._id.toString() !== studentId && req.user._id.toString() !== mentorId) {
      return res.status(403).json({ message: 'Unauthorized access to this chat room' });
    }

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100);
      
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
