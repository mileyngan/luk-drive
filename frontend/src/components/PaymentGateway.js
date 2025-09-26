import React, { useState } from 'react';
import { Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { CreditCard, CheckCircle, XCircle } from 'react-bootstrap-icons';
import api from '../services/api';

const PaymentGateway = ({ 
  amount, 
  paymentType, 
  reference, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const paymentData = {
        amount,
        payment_type: paymentType,
        reference,
        payment_method: 'credit_card',
        card_details: {
          number: formData.cardNumber,
          expiry: formData.expiryDate,
          cvv: formData.cvv,
          holder: formData.cardHolder
        }
      };

      const response = await api.post('/payments/process', paymentData);
      
      if (response.data.success) {
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <Modal show={true} centered>
        <Modal.Body className="text-center">
          <CheckCircle className="text-success" size={60} />
          <h4 className="mt-3">Payment Successful!</h4>
          <p>Transaction completed successfully.</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5><CreditCard className="me-2" /> Payment Gateway</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Form.Label>Amount: {amount} XAF</Form.Label>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              required
              maxLength="19"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              required
              maxLength="5"
            />
          </Form.Group>
          
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
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                `Pay ${amount} XAF`
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PaymentGateway;