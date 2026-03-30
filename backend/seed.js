require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const RiskScore = require('./models/RiskScore');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Progress = require('./models/Progress');
const Badge = require('./models/Badge');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge';

const villages = ['North District Village', 'South Region School', 'East Community Center', 'Rural Valley Primary'];
const subjects = ['Mathematics', 'Science', 'English'];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await RiskScore.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Progress.deleteMany({});
    await Badge.deleteMany({});

    // 1. Create Mentor
    const mentor = await User.create({
      name: "Expert Mentor",
      email: "mentor@edubridge.ai",
      password: "password123",
      role: "mentor"
    });
    console.log('✅ Mentor created');

    // 2. Create NGO Admin
    const ngo = await User.create({
      name: "Global NGO",
      email: "ngo@edubridge.ai",
      password: "password123",
      role: "ngo"
    });
    console.log('✅ NGO Admin created');

    // 3. Create Students with Risk Scores, Progress, and Badges
    const studentsToCreate = 50;
    const students = [];

    console.log('Generating students...');
    for (let i = 0; i < studentsToCreate; i++) {
      const village = villages[Math.floor(Math.random() * villages.length)];
      const isAtRisk = Math.random() > 0.7;

      const student = await User.create({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@edubridge.ai`,
        password: "password123",
        role: "student"
      });

      // Risk scores
      const factors = {
        lowScores: isAtRisk ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
        missedAssignments: isAtRisk ? Math.random() * 0.6 + 0.4 : Math.random() * 0.2,
        lowAttendance: isAtRisk ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3,
        slowProgress: isAtRisk ? Math.random() * 0.7 + 0.3 : Math.random() * 0.4,
      };

      await RiskScore.create({
        studentId: student._id,
        factors,
        village
      });

      // Progress for each subject
      for (const subject of subjects) {
        const weeklyScores = [];
        let baseScore = isAtRisk ? 40 : 65;
        for (let w = 0; w < 7; w++) {
          baseScore += Math.floor(Math.random() * 10) - (isAtRisk ? 3 : 1);
          baseScore = Math.max(20, Math.min(100, baseScore));
          weeklyScores.push({ week: `W${w + 1}`, score: baseScore });
        }

        const topicMastery = new Map();
        const topics = subject === 'Mathematics'
          ? ['Algebra', 'Geometry', 'Fractions', 'Statistics']
          : subject === 'Science'
            ? ['Physics', 'Chemistry', 'Biology', 'Environment']
            : ['Grammar', 'Vocabulary', 'Writing', 'Reading'];

        topics.forEach(topic => {
          topicMastery.set(topic, Math.floor(Math.random() * 60) + (isAtRisk ? 10 : 40));
        });

        await Progress.create({
          studentId: student._id,
          subject,
          topicMastery,
          confidenceScore: isAtRisk ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 30) + 60,
          weeklyScores
        });
      }

      // Badges (random selection)
      const badgeTemplates = [
        { title: '7-Day Streak', description: 'Logged in for 7 days straight', type: 'streak', icon: 'zap', xpValue: 200 },
        { title: 'Math Master', description: 'Scored 90%+ on 3 Math assignments', type: 'mastery', icon: 'star', xpValue: 300 },
        { title: 'Consistency King', description: 'Completed all weekly tasks', type: 'consistency', icon: 'trophy', xpValue: 250 },
        { title: 'Super Helper', description: 'Helped a peer with a doubt', type: 'helper', icon: 'award', xpValue: 150 },
      ];

      const numBadges = Math.floor(Math.random() * 3) + 1;
      const shuffled = badgeTemplates.sort(() => 0.5 - Math.random());
      for (let b = 0; b < numBadges; b++) {
        await Badge.create({
          studentId: student._id,
          ...shuffled[b],
          unlocked: true,
          unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }

      students.push(student);
    }
    console.log(`✅ ${studentsToCreate} Students created with risk scores, progress, and badges`);

    // 4. Create Assignments
    const assignmentData = [
      { 
        title: 'Quadratic Equations Quiz', 
        subject: 'Mathematics', 
        mentorId: mentor._id, 
        description: 'Solve the following quadratic equations and select the correct roots.',
        dueDate: new Date(Date.now() + 86400000),
        questions: [
          { question: "What are the roots of x² - 5x + 6 = 0?", options: ["2, 3", "-2, -3", "1, 6", "-1, -6"], correctAnswer: 0 },
          { question: "If the discriminant is zero, the roots are:", options: ["Imaginary", "Real and Distinct", "Real and Equal", "None of these"], correctAnswer: 2 },
          { question: "The standard form of a quadratic equation is:", options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "y = mx + c"], correctAnswer: 1 }
        ]
      },
      { 
        title: 'Photosynthesis Deep Dive', 
        subject: 'Science', 
        mentorId: mentor._id, 
        description: 'Test your knowledge on the process of photosynthesis in plants.',
        dueDate: new Date(Date.now() + 172800000),
        questions: [
          { question: "Where does photosynthesis mainly occur in plants?", options: ["Roots", "Stem", "Leaves", "Flowers"], correctAnswer: 2 },
          { question: "What gas is released during photosynthesis?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 1 },
          { question: "Plants need sunlight, water, and ___ for photosynthesis.", options: ["Soil", "Oxygen", "Carbon Dioxide", "Fertilizer"], correctAnswer: 2 }
        ]
      },
      { 
        title: 'English Grammar Basics', 
        subject: 'English', 
        mentorId: mentor._id, 
        description: 'Identify the correct parts of speech and sentence structure.',
        dueDate: new Date(Date.now() + 259200000),
        questions: [
          { question: "Which of these is a noun?", options: ["Run", "Happy", "Elephant", "Quickly"], correctAnswer: 2 },
          { question: "Identify the verb in: 'She sings beautifully.'", options: ["She", "Sings", "Beautifully", "Is"], correctAnswer: 1 },
          { question: "What is the past tense of 'Go'?", options: ["Went", "Gone", "Going", "Goes"], correctAnswer: 0 }
        ]
      },
      { title: 'Newton\'s Laws', subject: 'Science', description: 'Explain all three laws of motion with real-world examples.', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { title: 'Essay Writing', subject: 'English', description: 'Write a 300-word essay on "My Role Model".', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Fraction Operations', subject: 'Mathematics', description: 'Practice addition, subtraction, multiplication, and division of fractions.', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { title: 'Chemical Reactions', subject: 'Science', description: 'Balance 10 chemical equations and identify reaction types.', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    ];

    for (const ad of assignmentData) {
      const assignment = await Assignment.create({ ...ad, mentorId: mentor._id });

      // Create submissions for all students (random status)
      for (const student of students) {
        const rand = Math.random();
        await Submission.create({
          studentId: student._id,
          assignmentId: assignment._id,
          status: rand > 0.6 ? 'submitted' : 'pending',
          submittedAt: rand > 0.6 ? new Date() : undefined,
          grade: rand > 0.6 ? Math.floor(Math.random() * 40) + 60 : undefined
        });
      }
    }
    console.log('✅ 5 Assignments created with submissions');

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`  1 Mentor: mentor@edubridge.ai / password123`);
    console.log(`  1 NGO:    ngo@edubridge.ai / password123`);
    console.log(`  50 Students: student1@edubridge.ai ... student50@edubridge.ai / password123`);
    console.log('─────────────────────────────────');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
