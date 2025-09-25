import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Send, ChatDots } from 'react-bootstrap-icons';
import api from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
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
      const response = await api.post('/chat', {
        message: inputMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to send message');
    }

    setLoading(false);
  };

  const sampleQuestions = [
    "Quelles sont les règles de priorité à un carrefour?",
    "Quand faut-il utiliser les feux de croisement?",
    "Quels sont les dangers à un passage à niveau?",
    "Comment conduire dans la brume?"
  ];

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <ChatDots className="me-2" />
              <h5 className="mb-0">AI Driving Assistant</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column" style={{ height: '600px' }}>
              <div className="flex-grow-1 overflow-auto mb-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted my-5">
                    <ChatDots size={50} className="mb-3" />
                    <p>Ask me about driving rules, road signs, or Cameroon traffic regulations!</p>
                    
                    <div className="mt-4">
                      <h6>Try asking:</h6>
                      {sampleQuestions.map((question, index) => (
                        <div key={index} className="mb-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setInputMessage(question)}
                            className="me-2 mb-2"
                          >
                            {question}
                          </Button>
                        </div>
                      ))}
                    </div>
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
                    placeholder="Ask about driving rules..."
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;