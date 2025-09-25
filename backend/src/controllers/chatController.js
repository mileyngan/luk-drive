const { supabase } = require('../config/database');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sendMessage = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { message } = req.body;

    let aiResponse = '';

    // Try OpenAI first, fallback to local response
    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful driving instructor assistant for Cameroon driving schools. Answer questions about driving rules, road signs, traffic regulations, and safe driving practices. Keep responses concise and helpful."
            },
            {
              role: "user",
              content: message
            }
          ],
        });
        aiResponse = completion.choices[0].message.content;
      } catch (openaiError) {
        // Fallback to local response
        aiResponse = getLocalResponse(message);
      }
    } else {
      aiResponse = getLocalResponse(message);
    }

    // Save the conversation
    await supabase
      .from('chat_messages')
      .insert({
        user_id,
        message,
        response: aiResponse
      });

    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function getLocalResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('priorité') || lowerMessage.includes('priority')) {
    return "À un carrefour sans signalisation, la priorité est à droite. Cependant, la priorité à droite ne s'applique pas aux véhicules venant d'une voie non revêtue.";
  } else if (lowerMessage.includes('feux') || lowerMessage.includes('lights')) {
    return "Les feux de croisement doivent être utilisés de nuit et en cas de mauvaise visibilité. Les feux de route sont réservés aux routes non éclairées.";
  } else if (lowerMessage.includes('vitesse') || lowerMessage.includes('speed')) {
    return "Dans les agglomérations, la vitesse est limitée à 50 km/h. Sur les routes hors agglomération, la vitesse est de 90 km/h pour les voitures particulières.";
  } else if (lowerMessage.includes('alcool') || lowerMessage.includes('alcohol')) {
    return "Le taux d'alcoolémie autorisé est de 0,2 g/l pour les conducteurs expérimentés et 0,0 g/l pour les conducteurs débutants.";
  } else if (lowerMessage.includes('permis') || lowerMessage.includes('license')) {
    return "Pour conduire en Cameroun, vous devez avoir un permis de conduire valide. Le permis de catégorie B permet de conduire des voitures particulières.";
  } else if (lowerMessage.includes('sign') || lowerMessage.includes('panneau')) {
    return "Les panneaux de signalisation sont classés en panneaux d'interdiction (cercle rouge), d'obligation (cercle bleu), d'alerte (triangle rouge), et de prescription (rectangle bleu).";
  } else {
    return "Merci pour votre question. En tant qu'assistant de conduite au Cameroun, je peux vous aider avec les règles de circulation, les panneaux de signalisation, les limitations de vitesse, et les conseils de conduite sécuritaire. Que souhaitez-vous savoir ?";
  }
}

module.exports = { sendMessage };