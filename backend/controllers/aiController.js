const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Strengthened system prompt for Tutoring Accuracy
const TUTOR_SYSTEM_PROMPT = `You are EduBridge Tutor, the primary AI support for underserved students. 
IMPORTANT: Your goal is 100% correct, step-by-step educational explanations. 
1. If students ask a question, answer it directly and accurately first. 
2. Use simple language and clear examples. 
3. If they upload a problem (OCR), explain the logic behind the solution. 
4. NEVER give lazy or generic answers. Stay strictly within the context of the student's academic doubt.
5. If the user is confused, break the concept down into even smaller, foundational parts.`;

exports.chatWithAI = async (req, res) => {
  const { message, history } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      const msgLow = message.toLowerCase();
      let reply = "Hello! I'm your EduBridge AI Tutor. Please provide an OpenAI API Key in the backend .env for the full experience. \n\nI can still help with academic basics!";
      
      if (msgLow.includes('math') || msgLow.includes('solve')) {
        reply = "Math is all about logic! To solve an equation like 2x + 5 = 15, you first subtract 5 from both sides (2x = 10) and then divide by 2 (x = 5). Would you like to try another algebra problem?";
      } else if (msgLow.includes('science') || msgLow.includes('concept')) {
        reply = "In Science, we use the scientific method: Observe, Hypothesize, Experiment, and Conclude. Are you studying Physics, Chemistry, or Biology right now?";
      } else if (msgLow.includes('english') || msgLow.includes('grammar')) {
        reply = "English mastery comes from reading and practice! Remember that a sentence always needs a subject and a verb. How can I help with your vocabulary today?";
      }
      
      return res.json({ reply });
    }

    const passHistory = history ? history.map(h => ({ role: h.role === 'ai' ? 'assistant' : h.role, content: h.content })) : [];

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: TUTOR_SYSTEM_PROMPT },
        ...passHistory,
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI Assistant temporarily unavailable.' });
  }
};

// New: Analyze student performance from graph data
exports.analyzePerformance = async (req, res) => {
  const { scores } = req.body; // Array of { day, score }

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      const avg = scores.reduce((s, c) => s + c.score, 0) / (scores.length || 1);
      const isImproving = scores.length > 1 && scores[scores.length-1].score >= scores[0].score;
      
      return res.json({ 
        analysis: `Your average this week is ${Math.round(avg)}%. ${isImproving ? "You're showing a great upward trend!" : "You've had some ups and downs, but keep pushing!"} Focus on reviewing the topics from your lowest scoring days to strengthen your foundation.` 
      });
    }

    const scoresStr = scores.map(s => `${s.day}: ${s.score}%`).join(", ");
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an Academic Performance Analyst. Look at the student's scores and provide a brief, encouraging 2-sentence summary of their progress and one specific tip for improvement." },
        { role: "user", content: `My scores this week: ${scoresStr}` }
      ],
      model: "gpt-3.5-turbo",
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Analysis failed.' });
  }
};

// Generate 5 questions based on a topic
exports.generateQuestions = async (req, res) => {
  const { topic, subject } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      // Mock generation for demo
      const questions = [
        { question: `What is the fundamental concept of ${topic}?`, options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: 0 },
        { question: `Which of these is related to ${subject}?`, options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"], correctAnswer: 1 },
        { question: `How do we apply ${topic} in real life?`, options: ["Use 1", "Use 2", "Use 3", "Use 4"], correctAnswer: 2 },
        { question: `True or False: ${topic} is related to ${subject}.`, options: ["True", "False"], correctAnswer: 0 },
        { question: `Solve a simple problem on ${topic}.`, options: ["Sol 1", "Sol 2", "Sol 3", "Sol 4"], correctAnswer: 3 },
      ];
      return res.json({ questions });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an educational content creator. Generate 5 multiple-choice questions in JSON format: { questions: [{ question: string, options: [string], correctAnswer: number (0-3) }] } based on the provided topic." },
        { role: "user", content: `Topic: ${topic}, Subject: ${subject}` }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));

  } catch (error) {
    console.error('AI Question Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate questions.' });
  }
};
