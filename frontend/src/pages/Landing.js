import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav, Modal, Form, Badge } from 'react-bootstrap';

const Landing = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Simulate loading
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#1a1a1a' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Define dark mode colors
  const darkColors = {
    primary: '#3b82f6', // A bright blue for highlights
    primaryDark: '#2563eb', // Slightly darker blue for contrast
    secondary: '#10b981', // A bright green
    background: '#1a1a1a', // Dark background
    surface: '#2d2d2d', // Darker surface color
    surfaceLight: '#3d3d3d', // Lighter surface for cards
    textPrimary: '#f3f4f6', // Light text
    textSecondary: '#9ca3af', // Muted text
    textMuted: '#6b7280', // More muted text
    border: '#4b5563', // Border color
  };

  return (
    <div className="landing-page" style={{ backgroundColor: darkColors.background, color: darkColors.textPrimary }}>
      {/* Professional Navigation */}
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        fixed="top" 
        className="shadow-sm border-bottom"
        style={{ backgroundColor: darkColors.surface, borderColor: darkColors.border }}
      >
        <Container>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            {/* Using a simple text/emoji as a placeholder for the Car icon */}
            <span className="me-2" role="img" aria-label="car">🚗</span>
            <span className="fw-bold" style={{ color: darkColors.primary }}>SmartDrive</span>
            <span className="ms-1 text-muted small">Cameroon</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="text-light">Home</Nav.Link>
              <Nav.Link href="#features" className="text-light">Features</Nav.Link>
              <Nav.Link href="#pricing" className="text-light">Pricing</Nav.Link>
              <Nav.Link href="#about" className="text-light">About</Nav.Link>
            </Nav>
            <Nav>
              <Button 
                variant="outline-primary" 
                href="/login" 
                className="me-2"
                style={{ borderColor: darkColors.primary, color: darkColors.primary }}
              >
                Login
              </Button>
              <Button 
                variant="primary" 
                href="/register-school"
                style={{ backgroundColor: darkColors.primary, borderColor: darkColors.primary }}
              >
                Register
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div 
        className="bg-gradient text-white py-5" 
        style={{ 
          marginTop: '70px',
          background: `linear-gradient(135deg, ${darkColors.primaryDark} 0%, #1e3a8a 100%)`, // Darker blue gradient
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-4">
                Transform Your Driving School in Cameroon
              </h1>
              <p className="lead mb-4">
                The smart solution for modern driving schools. 
                Digital learning, anti-piracy security, and educational excellence.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button 
                  variant="light" 
                  size="lg" 
                  href="/register-school"
                  className="text-primary fw-bold"
                >
                  {/* Placeholder for Building icon */}
                  <span className="me-2">🏢</span>
                  Create School
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg" 
                  href="#features"
                >
                  {/* Placeholder for Book icon */}
                  <span className="me-2">📖</span>
                  Learn More
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center">
                <div className="bg-white rounded-4 p-4 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: darkColors.background }}>
                  {/* Placeholder for Car icon */}
                  <span className="text-primary" style={{ fontSize: '60px' }}>🚗</span>
                  <h3 className="text-primary mb-3">SmartDrive Cameroon</h3>
                  <p className="text-muted">
                    Cameroon's first intelligent driving education platform
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <Badge bg="success" className="px-3 py-2">100+ Schools</Badge>
                    <Badge bg="info" className="px-3 py-2">5000+ Students</Badge>
                    <Badge bg="warning" className="px-3 py-2">95% Success</Badge>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Social Advantages Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="display-6 fw-bold mb-4" style={{ color: darkColors.primary }}>
              Why SmartDrive is a Social Advantage?
            </h2>
            <p className="lead text-muted">
              A solution that transforms road education in Cameroon
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center p-4">
                {/* Placeholder for Car icon */}
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-4">
                  <span className="text-primary" style={{ fontSize: '30px' }}>🚗</span>
                </div>
                <Card.Title className="text-primary">Fewer Cars Needed</Card.Title>
                <Card.Text className="text-muted">
                  Online theoretical training reduces the need for cars for initial training. 
                  Less traffic, less pollution.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center p-4">
                {/* Placeholder for Graduation icon */}
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-4">
                  <span className="text-success" style={{ fontSize: '30px' }}>🎓</span>
                </div>
                <Card.Title className="text-success">Better Education</Card.Title>
                <Card.Text className="text-muted">
                  Standardized educational content updated regularly according to Cameroonian road laws. 
                  More effective and uniform training.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center p-4">
                {/* Placeholder for Person icon */}
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-4">
                  <span className="text-warning" style={{ fontSize: '30px' }}>👥</span>
                </div>
                <Card.Title className="text-warning">More Access</Card.Title>
                <Card.Text className="text-muted">
                  Students can learn at their own pace, anywhere in Cameroon. 
                  Equal access to quality training.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Interactive Features Section */}
      <Container className="py-5" style={{ backgroundColor: darkColors.surface }}>
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="display-6 fw-bold mb-4" style={{ color: darkColors.primary }}>
              Innovative Features
            </h2>
            <p className="lead text-muted">
              Designed specifically for driving schools' needs in Cameroon
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    {/* Placeholder for Book icon */}
                    <span className="text-primary">📖</span>
                  </div>
                  <div>
                    <Card.Title className="text-primary">Digital Courses</Card.Title>
                    <Card.Text className="text-muted">
                      Electronic manuals with Cameroonian content, educational videos, 
                      and assessment tests.
                    </Card.Text>
                  </div>
                </div>
                
                <div className="ms-5 ps-3 border-start" style={{ borderColor: darkColors.border }}>
                  {/* Placeholder for CheckCircle icon */}
                  <p className="mb-1"><span className="text-success me-2">✅</span>Cameroonian road rules</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Video lessons</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Practice tests</p>
                  <p className="mb-0"><span className="text-success me-2">✅</span>Progress tracking</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    {/* Placeholder for Shield icon */}
                    <span className="text-success">🛡️</span>
                  </div>
                  <div>
                    <Card.Title className="text-success">Anti-Piracy Protection</Card.Title>
                    <Card.Text className="text-muted">
                      Advanced ebook protection with camera detection to prevent content sharing.
                    </Card.Text>
                  </div>
                </div>
                
                <div className="ms-5 ps-3 border-start" style={{ borderColor: darkColors.border }}>
                  {/* Placeholder for CheckCircle icon */}
                  <p className="mb-1"><span className="text-success me-2">✅</span>Camera monitoring</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Content encryption</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Screenshot blocking</p>
                  <p className="mb-0"><span className="text-success me-2">✅</span>Secure reading</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    {/* Placeholder for ChatDots icon */}
                    <span className="text-warning">💬</span>
                  </div>
                  <div>
                    <Card.Title className="text-warning">AI Driving Assistant</Card.Title>
                    <Card.Text className="text-muted">
                      24/7 support for driving rules, road signs, and traffic regulations in French and English.
                    </Card.Text>
                  </div>
                </div>
                
                <div className="ms-5 ps-3 border-start" style={{ borderColor: darkColors.border }}>
                  {/* Placeholder for CheckCircle icon */}
                  <p className="mb-1"><span className="text-success me-2">✅</span>24/7 availability</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Cameroonian rules</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Multilingual support</p>
                  <p className="mb-0"><span className="text-success me-2">✅</span>Instant answers</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                    {/* Placeholder for Car icon */}
                    <span className="text-info">🚗</span>
                  </div>
                  <div>
                    <Card.Title className="text-info">Virtual Driving Simulation</Card.Title>
                    <Card.Text className="text-muted">
                      Interactive driving exercises to practice skills before real-world driving.
                    </Card.Text>
                  </div>
                </div>
                
                <div className="ms-5 ps-3 border-start" style={{ borderColor: darkColors.border }}>
                  {/* Placeholder for CheckCircle icon */}
                  <p className="mb-1"><span className="text-success me-2">✅</span>Virtual exercises</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Performance tracking</p>
                  <p className="mb-1"><span className="text-success me-2">✅</span>Realistic scenarios</p>
                  <p className="mb-0"><span className="text-success me-2">✅</span>Safety training</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Pricing Section */}
      <Container className="py-5" id="pricing">
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="display-6 fw-bold mb-4" style={{ color: darkColors.primary }}>
              Pricing Plans
            </h2>
            <p className="lead text-muted">
              Choose the plan that fits your driving school
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-primary border-2" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Header className="text-center bg-primary text-white" style={{ backgroundColor: darkColors.primary, borderColor: darkColors.primary }}>
                <h4>Basic</h4>
                <h5 className="mb-0">Free</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled">
                  {/* Placeholder for CheckCircle icon */}
                  <li className="mb-2"><span className="text-success me-2">✅</span> Up to 50 students</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Basic courses</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> AI chat support</li>
                  {/* Placeholder for CheckCircle icon (muted) */}
                  <li className="mb-2 text-muted"><span className="text-muted me-2">✅</span> Advanced analytics</li>
                  <li className="mb-2 text-muted"><span className="text-muted me-2">✅</span> Anti-piracy protection</li>
                </ul>
                <Button variant="outline-primary" href="/register-school" className="w-100" style={{ borderColor: darkColors.primary, color: darkColors.primary }}>
                  Get Started
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-success border-2 shadow" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Header className="text-center bg-success text-white" style={{ backgroundColor: darkColors.secondary, borderColor: darkColors.secondary }}>
                <h4>Pro</h4>
                <h5 className="mb-0">$99/month</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled">
                  {/* Placeholder for CheckCircle icon */}
                  <li className="mb-2"><span className="text-success me-2">✅</span> Up to 200 students</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Advanced courses</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> AI quiz generation</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Advanced analytics</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Anti-piracy protection</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Virtual simulations</li>
                </ul>
                <Button variant="success" href="/register-school" className="w-100" style={{ backgroundColor: darkColors.secondary, borderColor: darkColors.secondary }}>
                  Get Started
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-warning border-2" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Header className="text-center bg-warning text-dark" style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                <h4>Enterprise</h4>
                <h5 className="mb-0">Custom</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled">
                  {/* Placeholder for CheckCircle icon */}
                  <li className="mb-2"><span className="text-success me-2">✅</span> Unlimited students</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Custom features</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Priority support</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> White-label solution</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> API access</li>
                  <li className="mb-2"><span className="text-success me-2">✅</span> Dedicated manager</li>
                </ul>
                <Button variant="outline-warning" href="/register-school" className="w-100" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                  Contact Sales
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Testimonials Section */}
      <Container className="py-5" style={{ backgroundColor: darkColors.surface }}>
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="display-6 fw-bold mb-4" style={{ color: darkColors.primary }}>
              What Our Schools Say
            </h2>
            <p className="lead text-muted">
              Success stories from driving schools across Cameroon
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center">
                {/* Placeholder for Star icon */}
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <span className="text-warning" style={{ fontSize: '30px' }}>⭐</span>
                </div>
                <p className="text-muted mb-4">
                  "SmartDrive has revolutionized our teaching methods. Our students are more prepared and our pass rates have increased by 30%."
                </p>
                <div>
                  <h6 className="text-primary">Jean Mbala</h6>
                  <small className="text-muted">Director, Yaoundé Driving School</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center">
                {/* Placeholder for Star icon */}
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <span className="text-warning" style={{ fontSize: '30px' }}>⭐</span>
                </div>
                <p className="text-muted mb-4">
                  "The virtual simulation feature has been game-changing. Students can practice dangerous scenarios safely before real driving."
                </p>
                <div>
                  <h6 className="text-primary">Marie Nkomo</h6>
                  <small className="text-muted">Instructor, Douala Driving Academy</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body className="text-center">
                {/* Placeholder for Star icon */}
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <span className="text-warning" style={{ fontSize: '30px' }}>⭐</span>
                </div>
                <p className="text-muted mb-4">
                  "Anti-piracy protection has saved us from content theft. The AI chat helps students learn road rules effectively."
                </p>
                <div>
                  <h6 className="text-primary">Pierre Tchoungui</h6>
                  <small className="text-muted">Owner, Bamenda Road School</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Contact Section */}
      <Container className="py-5" id="about">
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="display-6 fw-bold mb-4" style={{ color: darkColors.primary }}>
              About SmartDrive Cameroon
            </h2>
            <p className="lead text-muted">
              Solving the car shortage problem in driving schools through digital education
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <h4 className="text-primary mb-4">Our Mission</h4>
            <p className="text-muted">
              SmartDrive Cameroon is the leading AI-powered learning platform designed specifically 
              for driving schools in Cameroon. We solve the car shortage problem by providing 
              digital learning solutions that prepare students for practical exams.
            </p>
            <p className="text-muted">
              Our innovative platform combines artificial intelligence, anti-piracy technology, 
              and comprehensive learning management to transform traditional driving education.
            </p>
            
            <h4 className="text-primary mb-4 mt-4">Contact Us</h4>
            {/* Placeholder for Phone icon */}
            <div className="d-flex align-items-center mb-3">
              <span className="text-primary me-3">📞</span>
              <span>+237 123 456 789</span>
            </div>
            {/* Placeholder for Envelope icon */}
            <div className="d-flex align-items-center mb-3">
              <span className="text-primary me-3">✉️</span>
              <span>info@smartdrive.cm</span>
            </div>
            {/* Placeholder for Building icon */}
            <div className="d-flex align-items-center">
              <span className="text-primary me-3">🏢</span>
              <span>Yaoundé, Cameroon</span>
            </div>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: darkColors.surfaceLight, color: darkColors.textPrimary }}>
              <Card.Body>
                <h5 className="text-primary mb-4">Stay Updated</h5>
                <p className="text-muted mb-4">
                  Subscribe to our newsletter for updates and special offers.
                </p>
                
                <Form onSubmit={handleSubscribe}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ backgroundColor: darkColors.background, color: darkColors.textPrimary, borderColor: darkColors.border }}
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="w-100"
                    style={{ backgroundColor: darkColors.primary, borderColor: darkColors.primary }}
                  >
                    Subscribe
                  </Button>
                </Form>
                
                {isSubscribed && (
                  <div className="alert alert-success mt-3" role="alert" style={{ backgroundColor: '#166534', borderColor: '#166534', color: 'white' }}>
                    {/* Placeholder for CheckCircle icon */}
                    <span className="me-2">✅</span>
                    Thank you for subscribing!
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4" style={{ backgroundColor: '#0f172a' }}>
        <Container>
          <Row>
            <Col md={4}>
              <h5 className="text-primary">SmartDrive Cameroon</h5>
              <p className="text-light">
                AI-powered driving school management platform for Cameroon
              </p>
            </Col>
            <Col md={2}>
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li><a href="/register-school" className="text-light">Register School</a></li>
                <li><a href="/login" className="text-light">Login</a></li>
                <li><a href="#features" className="text-light">Features</a></li>
              </ul>
            </Col>
            <Col md={3}>
              <h6>Support</h6>
              <ul className="list-unstyled">
                <li><a href="#about" className="text-light">About Us</a></li>
                <li><a href="#pricing" className="text-light">Pricing</a></li>
                <li><a href="#" className="text-light" onClick={() => setShowContactModal(true)}>Contact</a></li>
              </ul>
            </Col>
            <Col md={3}>
              <h6>Follow Us</h6>
              <div className="d-flex gap-2">
                {/* Simple text for social icons */}
                <Button variant="outline-light" size="sm" className="rounded-circle" style={{ borderColor: darkColors.textSecondary, color: darkColors.textSecondary }}>
                  <span className="text-light">f</span>
                </Button>
                <Button variant="outline-light" size="sm" className="rounded-circle" style={{ borderColor: darkColors.textSecondary, color: darkColors.textSecondary }}>
                  <span className="text-light">t</span>
                </Button>
                <Button variant="outline-light" size="sm" className="rounded-circle" style={{ borderColor: darkColors.textSecondary, color: darkColors.textSecondary }}>
                  <span className="text-light">in</span>
                </Button>
              </div>
            </Col>
          </Row>
          <hr className="my-4" style={{ borderColor: darkColors.border }} />
          <Row>
            <Col className="text-center">
              <small className="text-light">
                © 2025 SmartDrive Cameroon. All rights reserved.
              </small>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: darkColors.surface, color: darkColors.textPrimary, borderColor: darkColors.border }}>
          <Modal.Title style={{ color: darkColors.textPrimary }}>Contact Us</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: darkColors.surface, color: darkColors.textPrimary }}>
          <p>Have questions? Reach out to us:</p>
          {/* Placeholder for Phone icon */}
          <div className="d-flex align-items-center mb-2">
            <span className="text-primary me-3">📞</span>
            <span>+237 123 456 789</span>
          </div>
          {/* Placeholder for Envelope icon */}
          <div className="d-flex align-items-center mb-2">
            <span className="text-primary me-3">✉️</span>
            <span>info@smartdrive.cm</span>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: darkColors.surface, borderColor: darkColors.border }}>
          <Button variant="secondary" onClick={() => setShowContactModal(false)} style={{ backgroundColor: darkColors.textMuted, borderColor: darkColors.textMuted }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Landing;