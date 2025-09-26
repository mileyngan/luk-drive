import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Alert, Modal } from 'react-bootstrap';
import { Camera, ShieldLock, EyeSlash } from 'react-bootstrap-icons';

const EbookReader = ({ chapter }) => {
  const [isReading, setIsReading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isReading && cameraActive) {
      startCameraDetection();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [isReading, cameraActive]);

  const startCameraDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start detection interval
      intervalRef.current = setInterval(() => {
        detectCameraActivity();
      }, 2000); // Check every 2 seconds
    } catch (err) {
      console.error('Camera access denied:', err);
      setShowWarning(true);
    }
  };

  const detectCameraActivity = () => {
    // Simple detection logic - in real app, use ML model
    const hasFace = Math.random() > 0.3; // Simulate detection
    
    if (!hasFace) {
      setShowWarning(true);
      // Blur the ebook content
      document.querySelectorAll('.ebook-content').forEach(el => {
        el.style.filter = 'blur(5px)';
      });
    } else {
      // Clear blur
      document.querySelectorAll('.ebook-content').forEach(el => {
        el.style.filter = 'none';
      });
    }
  };

  const startReading = () => {
    setIsReading(true);
    setCameraActive(true);
    setShowCamera(true);
  };

  const stopReading = () => {
    setIsReading(false);
    setCameraActive(false);
    setShowCamera(false);
    setShowWarning(false);
    
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>{chapter.title}</h5>
          <div>
            <Button 
              variant="primary" 
              onClick={startReading}
              disabled={isReading}
            >
              <EyeSlash className="me-2" /> Start Reading
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="ebook-content">
          <div 
            className="position-relative"
            style={{ 
              filter: isReading ? 'none' : 'blur(10px)',
              transition: 'filter 0.3s ease'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: chapter.ebook_content || 'No content available' }} />
          </div>
          
          {isReading && (
            <Alert variant="info" className="mt-3">
              <Camera className="me-2" />
              Camera protection is active. Do not share this content.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Camera Modal */}
      <Modal show={showCamera} onHide={stopReading} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Camera Protection Active</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', maxHeight: '300px', border: '2px solid #007bff', borderRadius: '8px' }}
            />
            <p className="mt-3">
              <ShieldLock className="me-2" />
              Camera protection is monitoring your reading session
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopReading}>
            Stop Reading
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Warning Modal */}
      <Modal show={showWarning} onHide={() => setShowWarning(false)} centered>
        <Modal.Header className="bg-warning text-white">
          <Modal.Title>Security Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Unauthorized activity detected. Content has been blurred for protection.</p>
          <p>Please ensure you are reading this content personally.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowWarning(false)}>
            Acknowledge
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EbookReader;