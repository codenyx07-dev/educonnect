const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
  submittedAt: { type: Date },
  grade: { type: Number, min: 0, max: 100 },
  score: { type: Number, min: 0, max: 100 },
  answers: [{ type: Number }], // List of selected option indices
  feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
