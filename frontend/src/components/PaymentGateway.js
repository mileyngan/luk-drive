import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Modal, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import { CreditCard, CheckCircle, XCircle, Phone, Smartphone } from 'react-bootstrap-icons';
import api from '../services/api';

const PaymentGateway = ({
  amount,
  paymentType,
  reference,
  onSuccess,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [formData, setFormData] = useState({
    // Card payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    // Mobile money
    phoneNumber: '',
    provider: 'mtn'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    if (paymentType === 'subscription') {
      fetchSubscriptionPlans();
    }
  }, [paymentType]);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await api.get('/payments/subscription-plans');
      setSubscriptionPlans(response.data.plans);
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProcessingStep('Processing payment...');

    try {
      let paymentData = {
        amount: paymentType === 'subscription' ? subscriptionPlans[selectedPlan]?.price : amount,
        payment_type: paymentType,
        reference,
        payment_method: paymentMethod === 'card' ? 'card' :
                      paymentMethod === 'mtn' ? 'mtn_mobile_money' : 'orange_money'
      };

      if (paymentMethod === 'card') {
        paymentData.card_details = {
          number: formData.cardNumber,
          expiry: formData.expiryDate,
          cvv: formData.cvv,
          holder: formData.cardHolder
        };
      } else {
        paymentData.phone_number = formData.phoneNumber;
        paymentData.provider = formData.provider;
      }

      if (paymentType === 'subscription') {
        paymentData.payment_type = selectedPlan;
      }

      setProcessingStep('Contacting payment gateway...');
      const response = await api.post('/payments/process', paymentData);

      if (response.data.success) {
        setProcessingStep('Payment successful!');
        setSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
        }, 2000);
      } else {
        setError(response.data.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment processing failed');
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getPaymentAmount = () => {
    if (paymentType === 'subscription') {
      return subscriptionPlans[selectedPlan]?.price || amount;
    }
    return amount;
  };

  if (success) {
    return (
      <Modal show={true} centered>
        <Modal.Body className="text-center">
          <CheckCircle className="text-success" size={60} />
          <h4 className="mt-3">Payment Successful!</h4>
          <p>Transaction completed successfully.</p>
          {paymentType === 'subscription' && (
            <p className="text-muted">
              Your {selectedPlan} subscription is now active.
            </p>
          )}
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5><CreditCard className="me-2" /> Payment Gateway</h5>
        <div className="mt-2">
          <Badge bg="info">
            Amount: {getPaymentAmount()} XAF
          </Badge>
          {paymentType === 'subscription' && (
            <Badge bg="secondary" className="ms-2">
              {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
            </Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {paymentType === 'subscription' && (
          <div className="mb-4">
            <h6>Select Subscription Plan</h6>
            <Row>
              {Object.entries(subscriptionPlans).map(([planKey, plan]) => (
                <Col md={4} key={planKey}>
                  <Card
                    className={`mb-3 ${selectedPlan === planKey ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPlan(planKey)}
                  >
                    <Card.Body className="text-center">
                      <h5 className="text-capitalize">{planKey}</h5>
                      <h4 className="text-primary">{plan.price} XAF</h4>
                      <small className="text-muted">{plan.duration} days</small>
                      <ul className="list-unstyled mt-2 small">
                        {plan.features.map((feature, index) => (
                          <li key={index}>✓ {feature}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <Tabs activeKey={paymentMethod} onSelect={(k) => setPaymentMethod(k)} className="mb-3">
          <Tab eventKey="card" title={<><CreditCard className="me-1" />Card</>}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Card Number</Form.Label>
                <Form.Control
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setFormData(prev => ({ ...prev, cardNumber: formatted }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength="19"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setFormData(prev => ({ ...prev, expiryDate: formatted }));
                      }}
                      placeholder="MM/YY"
                      required
                      maxLength="5"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                      maxLength="3"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Card Holder Name</Form.Label>
                <Form.Control
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </Form.Group>
            </Form>
          </Tab>

          <Tab eventKey="mtn" title={<><Phone className="me-1" />MTN Mobile Money</>}>
            <Form onSubmit={handleSubmit}>
              <Alert variant="info">
                <strong>MTN Mobile Money</strong><br />
                Enter your MTN phone number. You'll receive a prompt to confirm the payment.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>MTN Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="237XXXXXXXXX"
                  required
                  pattern="^237[0-9]{9}$"
                />
                <Form.Text className="text-muted">
                  Format: 237XXXXXXXXX (without spaces or +)
                </Form.Text>
              </Form.Group>
            </Form>
          </Tab>

          <Tab eventKey="orange" title={<><Smartphone className="me-1" />Orange Money</>}>
            <Form onSubmit={handleSubmit}>
              <Alert variant="warning">
                <strong>Orange Money</strong><br />
                Enter your Orange phone number. You'll receive a prompt to confirm the payment.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>Orange Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="237XXXXXXXXX"
                  required
                  pattern="^237[0-9]{9}$"
                />
                <Form.Text className="text-muted">
                  Format: 237XXXXXXXXX (without spaces or +)
                </Form.Text>
              </Form.Group>
            </Form>
          </Tab>
        </Tabs>

        {processingStep && (
          <Alert variant="info" className="mb-3">
            <span className="spinner-border spinner-border-sm me-2"></span>
            {processingStep}
          </Alert>
        )}

        <div className="d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              `Pay ${getPaymentAmount()} XAF`
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PaymentGateway;
