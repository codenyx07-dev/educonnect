const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 }, // 0 to 100, computed in pre-save
  factors: {
    lowScores: { type: Number, default: 0 },
    missedAssignments: { type: Number, default: 0 },
    lowAttendance: { type: Number, default: 0 },
    slowProgress: { type: Number, default: 0 }
  },
  riskLevel: { type: String, enum: ['Safe', 'Moderate', 'Critical'], default: 'Safe' },
  village: { type: String }, // For NGO Heatmap grouping
  dateCalculated: { type: Date, default: Date.now }
});

// Formula implementation hook
riskScoreSchema.pre('save', function() {
  // Formula: (Low Scores * 30) + (Missed Assignments * 25) + (Low Attendance * 25) + (Slow Progress * 20)
  const calc = (this.factors.lowScores * 30) +
               (this.factors.missedAssignments * 25) +
               (this.factors.lowAttendance * 25) +
               (this.factors.slowProgress * 20);
  
  this.score = Math.min(Math.max(calc, 0), 100);
  
  if (this.score >= 70) this.riskLevel = 'Critical';
  else if (this.score >= 40) this.riskLevel = 'Moderate';
  else this.riskLevel = 'Safe';
});

module.exports = mongoose.model('RiskScore', riskScoreSchema);
