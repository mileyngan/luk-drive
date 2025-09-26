const { supabase } = require('../config/database');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sendMessage = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { message } = req.body;

    let response = '';
    
    // Try OpenAI first, fallback to local
    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        });
        response = completion.choices[0].message.content;
      } catch (error) {
        // Local fallback
        response = getLocalResponse(message);
      }
    } else {
      response = getLocalResponse(message);
    }

    // Save to database
    await supabase.from('chat_messages').insert({ user_id, message, response });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function getLocalResponse(message) {
  // Cameroon-specific responses
  return "Local response for: " + message;
}

module.exports = { sendMessage };