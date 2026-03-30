const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topicMastery: {
    type: Map,
    of: Number, // topic name → percentage (0-100)
    default: {}
  },
  confidenceScore: { type: Number, default: 50, min: 0, max: 100 },
  weeklyScores: [{
    week: { type: String }, // e.g. "2026-W13"
    score: { type: Number, min: 0, max: 100 }
  }],
  overallScore: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

// Calculate overall score from weekly scores
progressSchema.pre('save', function() {
  if (this.weeklyScores && this.weeklyScores.length > 0) {
    const sum = this.weeklyScores.reduce((acc, w) => acc + w.score, 0);
    this.overallScore = Math.round(sum / this.weeklyScores.length);
  }
});

module.exports = mongoose.model('Progress', progressSchema);
