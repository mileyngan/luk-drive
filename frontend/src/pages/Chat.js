import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col, Badge } from 'react-bootstrap';
import { Send, ChatDots, Shield } from 'react-bootstrap-icons';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour! Je suis votre assistant de conduite. Posez-moi des questions sur les règles de circulation, les panneaux de signalisation, ou les réglementations routières du Cameroun.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCameroonResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('priorité') || lowerMessage.includes('priority')) {
      return "Au Cameroun, la priorité à droite s'applique aux intersections sans signalisation. Cependant, la priorité à droite ne s'applique pas aux véhicules venant d'une voie non revêtue.";
    } else if (lowerMessage.includes('feux') || lowerMessage.includes('lights')) {
      return "Les feux de croisement doivent être utilisés de nuit et en cas de mauvaise visibilité. Les feux de route sont réservés aux routes non éclairées.";
    } else if (lowerMessage.includes('vitesse') || lowerMessage.includes('speed')) {
      return "Dans les agglomérations, la vitesse est limitée à 50 km/h. Sur les routes hors agglomération, la vitesse est de 90 km/h pour les voitures particulières.";
    } else if (lowerMessage.includes('alcool') || lowerMessage.includes('alcohol')) {
      return "Le taux d'alcoolémie autorisé est de 0,2 g/l pour les conducteurs expérimentés et 0,0 g/l pour les conducteurs débutants.";
    } else if (lowerMessage.includes('permis') || lowerMessage.includes('license')) {
      return "Pour conduire au Cameroun, vous devez avoir un permis de conduire valide. Le permis de catégorie B permet de conduire des voitures particulières.";
    } else if (lowerMessage.includes('sign') || lowerMessage.includes('panneau')) {
      return "Les panneaux de signalisation sont classés en panneaux d'interdiction (cercle rouge), d'obligation (cercle bleu), d'alerte (triangle rouge), et de prescription (rectangle bleu).";
    } else if (lowerMessage.includes('papier') || lowerMessage.includes('documents')) {
      return "Pour conduire légalement, vous devez avoir: permis de conduire, certificat d'immatriculation, assurance, et vignette fiscale.";
    } else if (lowerMessage.includes('rond-point') || lowerMessage.includes('roundabout')) {
      return "Au rond-point, les véhicules déjà engagés ont la priorité. Vous devez céder le passage aux véhicules venant de votre droite.";
    } else if (lowerMessage.includes('passe') || lowerMessage.includes('crossing')) {
      return "Au passage à niveau, arrêtez-vous si les barrières sont baissées ou si les feux clignotent. Respectez toujours les signaux.";
    } else {
      return "Merci pour votre question. En tant qu'assistant de conduite au Cameroun, je peux vous aider avec les règles de circulation, les panneaux de signalisation, les limitations de vitesse, et les conseils de conduite sécuritaire. Que souhaitez-vous savoir ?";
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Simulate AI response delay
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: getCameroonResponse(inputMessage),
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to get response');
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Quelles sont les règles de priorité à un carrefour?",
    "Quand faut-il utiliser les feux de croisement?",
    "Quels sont les dangers à un passage à niveau?",
    "Comment conduire dans la brume?",
    "Quels documents faut-il avoir en conduisant?"
  ];

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <Shield className="me-2" />
              <h5 className="mb-0">Assistant de Conduite Cameroun</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column" style={{ height: '600px' }}>
              <div className="flex-grow-1 overflow-auto mb-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted my-5">
                    <ChatDots size={50} className="mb-3" />
                    <p>Poser des questions sur les règles de conduite au Cameroun!</p>
                  </div>
                ) : (
                  <div className="chat-messages">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div
                          className={`p-3 rounded ${
                            message.sender === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-light border'
                          }`}
                          style={{ maxWidth: '80%' }}
                        >
                          <div className="d-flex align-items-center mb-1">
                            <small className="text-muted me-2">
                              {message.timestamp.toLocaleTimeString()}
                            </small>
                            {message.sender === 'ai' && (
                              <Badge bg="primary" className="ms-1">AI</Badge>
                            )}
                          </div>
                          <p className="mb-0">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={sendMessage}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Poser une question sur la conduite au Cameroun..."
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !inputMessage.trim()}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <Send />
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-2">
                <small className="text-muted">Questions populaires:</small>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;