import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { CreditCard, Receipt, Wallet, Clock } from 'react-bootstrap-icons';
import PaymentGateway from '../components/PaymentGateway';
import api from '../services/api';

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const initiatePayment = (type, amt) => {
    setPaymentType(type);
    setAmount(amt);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    fetchPayments(); // Refresh payment history
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Payment Dashboard</h2>
      
      {/* Payment Options Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Wallet className="text-primary mb-3" size={50} />
              <Card.Title>Course Payment</Card.Title>
              <Card.Text>Pay for specific courses or modules</Card.Text>
              <Button 
                variant="primary" 
                onClick={() => initiatePayment('course', 50000)}
              >
                Pay 50,000 XAF
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <CreditCard className="text-success mb-3" size={50} />
              <Card.Title>Exam Fee</Card.Title>
              <Card.Text>Pay for driving exam registration</Card.Text>
              <Button 
                variant="success" 
                onClick={() => initiatePayment('exam', 75000)}
              >
                Pay 75,000 XAF
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Receipt className="text-warning mb-3" size={50} />
              <Card.Title>Simulation Fee</Card.Title>
              <Card.Text>Pay for virtual driving exercises</Card.Text>
              <Button 
                variant="warning" 
                onClick={() => initiatePayment('simulation', 25000)}
              >
                Pay 25,000 XAF
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Card>
        <Card.Header>
          <h5>Payment History</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.reference}</td>
                  <td>{payment.amount} {payment.currency}</td>
                  <td>
                    <Badge bg="info">{payment.payment_type}</Badge>
                  </td>
                  <td>
                    <Badge 
                      bg={
                        payment.payment_status === 'completed' ? 'success' :
                        payment.payment_status === 'pending' ? 'warning' :
                        payment.payment_status === 'failed' ? 'danger' : 'secondary'
                      }
                    >
                      {payment.payment_status}
                    </Badge>
                  </td>
                  <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2">
                      View
                    </Button>
                    {payment.payment_status === 'pending' && (
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => initiatePayment(payment.payment_type, payment.amount)}
                      >
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentGateway
          amount={amount}
          paymentType={paymentType}
          reference={`PAY-${Date.now()}`}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default PaymentDashboard;