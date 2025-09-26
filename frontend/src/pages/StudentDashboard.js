import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Button, Alert } from 'react-bootstrap';
import { Book, CheckCircle, Clock, Shield } from 'react-bootstrap-icons';
import api from '../services/api';

const StudentDashboard = () => {
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [chaptersResponse, progressResponse] = await Promise.all([
        api.get('/chapters'),
        api.get('/student/progress')
      ]);
      
      setChapters(chaptersResponse.data);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const canContinue = (chapterId) => {
    const chapterProgress = progress[chapterId];
    return chapterProgress?.quiz_score >= 85 || chapterProgress?.completed;
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Student Dashboard</h2>
      
      <Row>
        {chapters.map((chapter, index) => {
          const chapterProgress = progress[chapter.id];
          const isCompleted = chapterProgress?.completed;
          const score = chapterProgress?.quiz_score || 0;
          const canAccess = canContinue(chapter.id);

          return (
            <Col md={6} lg={4} className="mb-4" key={chapter.id}>
              <Card className={`h-100 ${canAccess ? 'border-success' : 'border-warning'}`}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Chapter {chapter.chapter_number}: {chapter.title}</h6>
                  {isCompleted && <CheckCircle className="text-success" />}
                </Card.Header>
                <Card.Body>
                  <p className="text-muted small">
                    {chapter.description?.substring(0, 100)}...
                  </p>
                  
                  {chapterProgress && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{score}%</small>
                      </div>
                      <ProgressBar 
                        now={score} 
                        variant={score >= 85 ? 'success' : 'warning'} 
                        className="mb-2"
                      />
                      <small className={`text-${score >= 85 ? 'success' : 'warning'}`}>
                        {score >= 85 ? 'Ready to continue' : 'Score too low'}
                      </small>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Button 
                      variant={canAccess ? 'success' : 'outline-secondary'}
                      href={`/chapters/${chapter.id}`}
                      disabled={!canAccess}
                    >
                      {canAccess ? 'Continue' : 'Need 85% to continue'}
                    </Button>
                    
                    {!canAccess && score > 0 && (
                      <Alert variant="warning" className="p-2">
                        <small>Score: {score}%. Need 85% to continue.</small>
                      </Alert>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StudentDashboard;