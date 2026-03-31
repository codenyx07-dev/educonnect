const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  dueDate: { type: Date },
  resourceType: { type: String, enum: ['text', 'url', 'pdf', 'quiz'], default: 'text' },
  resourceUrl: { type: String },
  resourceFile: { type: String },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true } // Index of the correct option
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
