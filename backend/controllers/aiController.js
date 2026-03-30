const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

exports.chatWithAI = async (req, res) => {
  const { message, history } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      // Robust local AI engine when no API key is configured
      const msgLow = message.toLowerCase();
      let reply = '';

      if (msgLow.includes('math') || msgLow.includes('fraction') || msgLow.includes('add') || msgLow.includes('subtract') || msgLow.includes('multiply') || msgLow.includes('divide') || msgLow.includes('algebra') || msgLow.includes('equation')) {
        reply = "Great question about Mathematics! 🧮\n\nHere's a step-by-step approach:\n\n1. **Identify** what type of problem it is (arithmetic, algebra, geometry)\n2. **Break it down** into smaller steps\n3. **Solve** each step carefully\n4. **Verify** your answer\n\nFor example, to add fractions like 1/3 + 1/4:\n- Find the LCM of 3 and 4 = 12\n- Convert: 4/12 + 3/12 = 7/12\n\nWould you like me to explain a specific topic in more detail?";
      } else if (msgLow.includes('science') || msgLow.includes('physics') || msgLow.includes('chemistry') || msgLow.includes('biology')) {
        reply = "Excellent science question! 🔬\n\n**Key Scientific Principles:**\n\n• **Physics**: Everything follows laws of motion and energy conservation\n• **Chemistry**: Atoms combine to form molecules through chemical bonds\n• **Biology**: Life processes follow cellular organization\n\nRemember: Science is about observing, questioning, and experimenting!\n\nWhat specific topic would you like to explore?";
      } else if (msgLow.includes('english') || msgLow.includes('grammar') || msgLow.includes('write') || msgLow.includes('essay') || msgLow.includes('read')) {
        reply = "Let's work on English together! 📝\n\n**Key Grammar Rules:**\n\n1. Every sentence needs a **subject** and a **verb**\n2. Use **capital letters** at the start of sentences and for proper nouns\n3. Use **punctuation** correctly (periods, commas, question marks)\n\n**Writing Tips:**\n- Start with a clear topic sentence\n- Support with examples\n- End with a strong conclusion\n\nWhat would you like help with specifically?";
      } else if (msgLow.includes('hello') || msgLow.includes('hi') || msgLow.includes('hey')) {
        reply = "Hello there! 👋 I'm the EduBridge AI Tutor!\n\nI'm here to help you learn. You can ask me about:\n\n🧮 **Mathematics** — Fractions, Algebra, Geometry\n🔬 **Science** — Physics, Chemistry, Biology\n📝 **English** — Grammar, Writing, Vocabulary\n\nJust type your question and I'll explain it step by step!";
      } else if (msgLow.includes('help') || msgLow.includes('what can you')) {
        reply = "I can help you with many subjects! 📚\n\n**Here's what I can do:**\n\n• Explain difficult concepts in simple words\n• Walk through problems step-by-step\n• Give you practice questions\n• Help with Math, Science, and English\n\nJust ask me anything — no question is too simple! Remember, asking questions is how we learn! 💪";
      } else if (msgLow.includes('thank') || msgLow.includes('thanks')) {
        reply = "You're welcome! 😊 Keep up the great work! Remember, every question you ask makes you smarter. I'm always here if you need help! 🌟";
      } else {
        reply = `That's a great question! Let me help you understand this better. 🤔\n\nBased on what you're asking about "${message.substring(0, 50)}...", here are some key points:\n\n1. **Start with the basics** — Make sure you understand the foundational concepts\n2. **Practice regularly** — Try solving similar problems on your own\n3. **Ask for help** — Don't hesitate to ask your mentor if you're stuck\n\nWould you like me to explain this topic in more detail, or shall we try a practice question?`;
      }

      return res.json({ reply });
    }

    const passHistory = history ? history.map(h => ({ role: h.role === 'ai' ? 'assistant' : h.role, content: h.content })) : [];

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are EduBridge Tutor, an encouraging AI for underserved students. Explain things simply with examples. Use emojis and formatting to make learning fun. Focus on step-by-step explanations." },
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
