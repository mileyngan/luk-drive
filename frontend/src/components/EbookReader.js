import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Alert, Modal, ProgressBar, Badge } from 'react-bootstrap';
import { Camera, ShieldLock, EyeSlash, AlertTriangle, Lock, Wifi, WifiOff } from 'react-bootstrap-icons';
import * as faceapi from 'face-api.js';
import CryptoJS from 'crypto-js';
import api from '../services/api';

const EbookReader = ({ chapter }) => {
  const [isReading, setIsReading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState('');
  const [watermark, setWatermark] = useState('');
  const [deviceBound, setDeviceBound] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [piracyAlerts, setPiracyAlerts] = useState([]);
  const [sessionKey, setSessionKey] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const contentRef = useRef(null);

  // Device fingerprint for binding
  const deviceFingerprint = navigator.hardwareConcurrency +
    navigator.platform +
    navigator.userAgent +
    screen.width + 'x' + screen.height;

  useEffect(() => {
    // Load face-api.js models
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to load face detection models:', error);
      }
    };

    loadModels();

    // Interface restrictions
    const preventActions = (e) => {
      e.preventDefault();
      logPiracyIncident('interface_violation', { action: e.type });
      return false;
    };

    // Disable right-click
    document.addEventListener('contextmenu', preventActions);
    // Disable copy/paste
    document.addEventListener('copy', preventActions);
    document.addEventListener('paste', preventActions);
    document.addEventListener('cut', preventActions);
    // Disable print
    window.addEventListener('beforeprint', preventActions);
    // Disable dev tools
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U') ||
          e.key === 'F12') {
        e.preventDefault();
        logPiracyIncident('dev_tools_attempt');
        return false;
      }
    });

    // Screenshot prevention
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isReading) {
        logPiracyIncident('tab_switch');
        setShowWarning(true);
      }
    });

    // Check online status
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('copy', preventActions);
      document.removeEventListener('paste', preventActions);
      document.removeEventListener('cut', preventActions);
      window.removeEventListener('beforeprint', preventActions);
      document.removeEventListener('keydown', preventActions);
      document.removeEventListener('visibilitychange', handleOnline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isReading]);

  // Generate session key and validate access
  const initializeSession = useCallback(async () => {
    try {
      const response = await api.post('/chapters/validate-access', {
        chapterId: chapter.id,
        deviceFingerprint
      });

      if (response.data.valid) {
        setSessionKey(CryptoJS.lib.WordArray.random(256/8).toString());
        setDeviceBound(true);
        setWatermark(`SmartDrive - User: ${response.data.userId} - ${new Date().toISOString()}`);
        return true;
      } else {
        setShowWarning(true);
        return false;
      }
    } catch (error) {
      console.error('Access validation failed:', error);
      setShowWarning(true);
      return false;
    }
  }, [chapter.id, deviceFingerprint]);

  // Decrypt content
  const decryptContent = useCallback(async () => {
    try {
      const response = await api.get(`/chapters/${chapter.id}/content`, {
        headers: { 'X-Session-Key': sessionKey }
      });

      const decrypted = CryptoJS.AES.decrypt(response.data.encryptedContent, sessionKey).toString(CryptoJS.enc.Utf8);
      setDecryptedContent(decrypted);

      // Store in IndexedDB for offline access
      if ('indexedDB' in window) {
        const request = indexedDB.open('SmartDriveCache', 1);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('chapters')) {
            db.createObjectStore('chapters', { keyPath: 'id' });
          }
        };
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['chapters'], 'readwrite');
          const store = transaction.objectStore('chapters');
          store.put({
            id: chapter.id,
            content: decrypted,
            encrypted: response.data.encryptedContent,
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          });
        };
      }
    } catch (error) {
      console.error('Content decryption failed:', error);
      // Try offline cache
      loadOfflineContent();
    }
  }, [chapter.id, sessionKey]);

  // Load offline content
  const loadOfflineContent = () => {
    if ('indexedDB' in window) {
      const request = indexedDB.open('SmartDriveCache', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['chapters'], 'readonly');
        const store = transaction.objectStore('chapters');
        const getRequest = store.get(chapter.id);

        getRequest.onsuccess = () => {
          const cached = getRequest.result;
          if (cached && cached.expires > Date.now()) {
            setDecryptedContent(cached.content);
            setOfflineMode(true);
          } else {
            setShowWarning(true);
          }
        };
      };
    }
  };

  // Log piracy incidents
  const logPiracyIncident = async (type, details = {}) => {
    try {
      await api.post('/piracy/log', {
        chapterId: chapter.id,
        incidentType: type,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });

      setPiracyAlerts(prev => [...prev, {
        type,
        timestamp: new Date(),
        details
      }]);
    } catch (error) {
      console.error('Failed to log piracy incident:', error);
    }
  };

  const startCameraDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Start face detection
        intervalRef.current = setInterval(async () => {
          if (videoRef.current && modelsLoaded) {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            );

            const hasFace = detections.length > 0;
            setFaceDetected(hasFace);

            if (!hasFace) {
              setShowWarning(true);
              logPiracyIncident('no_face_detected');
              // Blur content
              if (contentRef.current) {
                contentRef.current.style.filter = 'blur(8px)';
              }
            } else {
              // Clear blur
              if (contentRef.current) {
                contentRef.current.style.filter = 'none';
              }
            }
          }
        }, 3000); // Check every 3 seconds
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      logPiracyIncident('camera_denied');
      setShowWarning(true);
    }
  };

  const startReading = async () => {
    const accessGranted = await initializeSession();
    if (!accessGranted) return;

    await decryptContent();
    setIsReading(true);
    setCameraActive(true);
    setShowCamera(true);

    if (modelsLoaded) {
      startCameraDetection();
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setCameraActive(false);
    setShowCamera(false);
    setShowWarning(false);
    setFaceDetected(false);

    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>{chapter.title}</h5>
          <div className="d-flex align-items-center gap-2">
            {offlineMode && <Badge bg="warning"><WifiOff /> Offline</Badge>}
            {deviceBound && <Badge bg="success"><Lock /> Bound</Badge>}
            <Button
              variant="primary"
              onClick={startReading}
              disabled={isReading}
            >
              <EyeSlash className="me-2" /> Start Reading
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Protection Status: {cameraActive ? 'Active' : 'Inactive'}
              </small>
              {faceDetected && <Badge bg="success">Face Detected</Badge>}
            </div>
            {piracyAlerts.length > 0 && (
              <Alert variant="danger" className="mt-2">
                <AlertTriangle className="me-2" />
                {piracyAlerts.length} security incident(s) detected
              </Alert>
            )}
          </div>

          <div
            ref={contentRef}
            className="ebook-content position-relative"
            style={{
              filter: isReading ? 'none' : 'blur(10px)',
              transition: 'filter 0.3s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            {/* Watermark overlay */}
            {isReading && watermark && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                  fontSize: '12px',
                  color: 'rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                {watermark}
              </div>
            )}

            <div
              dangerouslySetInnerHTML={{
                __html: decryptedContent || chapter.ebook_content || 'No content available'
              }}
            />
          </div>

          {isReading && (
            <Alert variant="info" className="mt-3">
              <ShieldLock className="me-2" />
              Anti-piracy protection active. Camera monitoring and content encryption enabled.
              {offlineMode && " Operating in offline mode."}
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
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <p className="mt-3">
              <ShieldLock className="me-2" />
              AI-powered face detection is monitoring your reading session
            </p>
            <div className="mt-2">
              <small className="text-muted">
                Face detected: {faceDetected ? 'Yes' : 'No'}
              </small>
            </div>
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
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Security Violation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Unauthorized activity detected. Content access has been restricted.</p>
          <p>Possible violations:</p>
          <ul>
            <li>No face detected by camera</li>
            <li>Attempted interface manipulation</li>
            <li>Device binding mismatch</li>
            <li>Access permission denied</li>
          </ul>
          <p>This incident has been logged for security review.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowWarning(false)}>
            Acknowledge
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EbookReader;
