const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Local AI responses for road code questions (Ollama simulation)
const generateLocalAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Road code knowledge base for Cameroon
  const responses = {
    // Speed limits
    'vitesse|limite': `Au Cameroun, les limites de vitesse sont:
• En agglomération: 50 km/h
• Hors agglomération: 90 km/h  
• Sur autoroute: 110 km/h
• En cas de pluie: réduire de 20 km/h`,

    // Traffic signs
    'panneau|signalisation': `Les panneaux de signalisation au Cameroun suivent les standards internationaux:
• Triangulaires rouges: DANGER
• Ronds rouges: INTERDICTION
• Ronds bleus: OBLIGATION
• Carrés/rectangulaires: INFORMATION`,

    // Priority rules
    'priorité|intersection': `Règles de priorité au Cameroun:
• Priorité à droite aux intersections
• Céder le passage aux véhicules venant de droite
• Stop obligatoire aux panneaux STOP
• Respecter les feux tricolores`,

    // Documents
    'permis|carte|document': `Documents obligatoires au Cameroun:
• Permis de conduire valide
• Carte grise du véhicule
• Attestation d'assurance
• Certificat de visite technique (si requis)`,

    // Parking
    'stationnement|parking': `Règles de stationnement:
• Interdit sur les passages piétons
• Interdit devant les bouches d'incendie
• Respecter les zones de stationnement payant
• Ne pas gêner la circulation`,

    // Safety
    'sécurité|ceinture': `Équipements de sécurité obligatoires:
• Ceinture de sécurité pour tous
• Casque pour les motocyclistes
• Gilet de sécurité dans le véhicule
• Triangle de présignalisation`,

    // Alcohol
    'alcool|boisson': `Alcool au volant au Cameroun:
• Taux légal: 0,8 g/l dans le sang
• Sanctions: amende, suspension de permis
• En cas d'accident: responsabilité pénale
• Conseil: 0 alcool au volant`,

    // Default response
    'default': `Je suis votre assistant virtuel pour le code de la route camerounais. 
Je peux vous aider avec:
• Les limites de vitesse
• La signalisation routière  
• Les règles de priorité
• Les documents obligatoires
• Le stationnement
• La sécurité routière

Posez-moi une question spécifique! 🚗`
  };

  // Find matching response
  for (const [keywords, response] of Object.entries(responses)) {
    if (keywords !== 'default') {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
        return response;
      }
    }
  }

  return responses.default;
};

// Chat with AI assistant
router.post('/ask', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let aiResponse;

    try {
      // Try OpenAI first if available
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Vous êtes un assistant virtuel expert du code de la route camerounais. 
              Répondez uniquement aux questions liées au code de la route, à la conduite, et à la sécurité routière au Cameroun. 
              Soyez précis, informatif et bienveillant. Si la question n'est pas liée au code de la route, 
              redirigez poliment vers des sujets de conduite.`
            },
            {
              role: "user", 
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        aiResponse = completion.choices[0].message.content;
      }
    } catch (error) {
      console.error('OpenAI error:', error);
      aiResponse = null;
    }

    // Fallback to local AI if OpenAI fails
    if (!aiResponse) {
      aiResponse = generateLocalAIResponse(message);
    }

    // Save conversation to database
    const { data: chatRecord, error: saveError } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: userId,
        message: message.trim(),
        response: aiResponse
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Save chat error:', saveError);
      // Continue anyway - don't fail the response
    }

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat AI error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Get chat history
router.get('/history', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({ 
      messages: messages.reverse() // Show oldest first
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;