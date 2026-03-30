const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['streak', 'mastery', 'consistency', 'helper'], required: true },
  icon: { type: String, default: 'award' }, // lucide icon name
  unlocked: { type: Boolean, default: true },
  xpValue: { type: Number, default: 100 },
  unlockedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
