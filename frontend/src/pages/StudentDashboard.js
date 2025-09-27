import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Button, Alert, Badge, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { 
  Book, CheckCircle, Clock, Shield, Lightbulb, GraphUp, Bullseye, Award, ExclamationTriangle, StarFill 
} from 'react-bootstrap-icons';
import api from '../services/api';

const StudentDashboard = () => {
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState({});

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

      generateInsights(chaptersResponse.data, progressResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateInsights = (chaptersData, progressData) => {
    const scores = Object.values(progressData).map(p => p.quiz_score).filter(score => score > 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const completedChapters = Object.values(progressData).filter(p => p.completed).length;
    const totalAttempts = Object.values(progressData).length;

    const subjectPerformance = {};
    chaptersData.forEach(chapter => {
      const chapterProgress = progressData[chapter.id];
      if (chapterProgress && chapterProgress.quiz_score > 0) {
        if (!subjectPerformance[chapter.subject]) {
          subjectPerformance[chapter.subject] = { scores: [], chapters: [] };
        }
        subjectPerformance[chapter.subject].scores.push(chapterProgress.quiz_score);
        subjectPerformance[chapter.subject].chapters.push(chapter);
      }
    });

    Object.keys(subjectPerformance).forEach(subject => {
      const data = subjectPerformance[subject];
      data.avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    });

    const recs = [];
    const strugglingSubjects = Object.entries(subjectPerformance)
      .filter(([subject, data]) => data.avgScore < 70)
      .sort((a, b) => a[1].avgScore - b[1].avgScore);

    if (strugglingSubjects.length > 0) {
      recs.push({
        type: 'practice',
        priority: 'high',
        title: 'Focus on Weak Areas',
        description: `Your performance in ${strugglingSubjects[0][0]} needs improvement. Consider reviewing the fundamentals.`,
        action: 'Practice more quizzes in this subject'
      });
    }

    const nextChapter = chaptersData.find(chapter => {
      const chapterProgress = progressData[chapter.id];
      return !chapterProgress || (!chapterProgress.completed && chapterProgress.quiz_score < 85);
    });

    if (nextChapter) {
      recs.push({
        type: 'next',
        priority: 'medium',
        title: 'Recommended Next Chapter',
        description: `Continue with Chapter ${nextChapter.chapter_number}: ${nextChapter.title}`,
        action: 'Start this chapter next'
      });
    }

    const recentActivity = Object.values(progressData)
      .filter(p => p.last_attempt_at)
      .sort((a, b) => new Date(b.last_attempt_at) - new Date(a.last_attempt_at))
      .slice(0, 7);

    if (recentActivity.length >= 5) {
      recs.push({
        type: 'streak',
        priority: 'low',
        title: 'Keep Up the Great Work!',
        description: 'You\'ve been active for the last few days. Maintain your study momentum!',
        action: 'Continue your daily practice'
      });
    }

    setInsights({
      avgScore: Math.round(avgScore),
      completedChapters,
      totalChapters: chaptersData.length,
      totalAttempts,
      subjectPerformance,
      completionRate: Math.round((completedChapters / chaptersData.length) * 100)
    });

    setRecommendations(recs);
  };

  const canContinue = (chapterId) => {
    const chapterProgress = progress[chapterId];
    return chapterProgress?.quiz_score >= 85 || chapterProgress?.completed;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const getPerformanceBadge = (score) => {
    if (score >= 90) return { variant: 'success', text: 'Excellent', icon: <StarFill /> };
    if (score >= 80) return { variant: 'info', text: 'Good', icon: <CheckCircle /> };
    if (score >= 70) return { variant: 'warning', text: 'Average', icon: <Clock /> };
    return { variant: 'danger', text: 'Needs Work', icon: <ExclamationTriangle /> };
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Learning Dashboard</h2>
        <Button variant="outline-primary" onClick={fetchStudentData}>
          <GraphUp className="me-2" />Refresh Progress
        </Button>
      </div>

      {/* Intelligent Insights */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0"><Lightbulb className="me-2" />Your Learning Insights</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className={`text-${insights.avgScore >= 80 ? 'success' : insights.avgScore >= 60 ? 'warning' : 'danger'}`}>
                      {insights.avgScore}%
                    </h4>
                    <small className="text-muted">Average Score</small>
                    <ProgressBar
                      now={insights.avgScore}
                      variant={insights.avgScore >= 80 ? 'success' : insights.avgScore >= 60 ? 'warning' : 'danger'}
                      className="mt-2"
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-info">{insights.completionRate}%</h4>
                    <small className="text-muted">Course Completion</small>
                    <ProgressBar now={insights.completionRate} variant="info" className="mt-2" />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-success">{insights.completedChapters}</h4>
                    <small className="text-muted">Chapters Completed</small>
                    <Badge bg="success" className="mt-2">
                      <Award className="me-1" />
                      {insights.completedChapters} of {insights.totalChapters}
                    </Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-warning">{insights.totalAttempts}</h4>
                    <small className="text-muted">Total Attempts</small>
                    <Badge bg="warning" className="mt-2">
                      <Bullseye className="me-1" />
                      Practice Sessions
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0"><Lightbulb className="me-2" />Personalized Recommendations</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {recommendations.map((rec, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <Alert variant={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}>
                        <h6>{rec.title}</h6>
                        <p className="mb-2">{rec.description}</p>
                        <small className="text-muted">{rec.action}</small>
                      </Alert>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="chapters" className="mb-4">
        <Tab eventKey="chapters" title="Course Chapters">
          <Row>
            {chapters.map((chapter) => {
              const chapterProgress = progress[chapter.id];
              const isCompleted = chapterProgress?.completed;
              const score = chapterProgress?.quiz_score || 0;
              const canAccess = canContinue(chapter.id);
              const performance = getPerformanceBadge(score);

              return (
                <Col md={6} lg={4} className="mb-4" key={chapter.id}>
                  <Card className={`h-100 ${canAccess ? 'border-success' : 'border-warning'}`}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Chapter {chapter.chapter_number}: {chapter.title}</h6>
                      <div>
                        {isCompleted && <CheckCircle className="text-success me-2" />}
                        <Badge bg={getDifficultyColor(chapter.difficulty_level)}>
                          {chapter.difficulty_level}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted small mb-3">
                        {chapter.description?.substring(0, 100)}...
                      </p>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small>Subject: <strong>{chapter.subject}</strong></small>
                          {chapterProgress && (
                            <Badge bg={performance.variant}>
                              {performance.icon} {performance.text}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {chapterProgress && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Progress</small>
                            <small>{score}%</small>
                          </div>
                          <ProgressBar
                            now={score}
                            variant={score >= 85 ? 'success' : score >= 70 ? 'warning' : 'danger'}
                            className="mb-2"
                          />
                          <small className={`text-${score >= 85 ? 'success' : 'warning'}`}>
                            {score >= 85 ? 'Ready to continue' : score >= 70 ? 'Good progress' : 'Needs improvement'}
                          </small>
                        </div>
                      )}

                      <div className="d-grid gap-2">
                        <Button
                          variant={canAccess ? 'success' : 'outline-secondary'}
                          href={`/chapters/${chapter.id}`}
                          disabled={!canAccess}
                        >
                          {canAccess ? 'Continue Learning' : 'Review Required'}
                        </Button>

                        {chapterProgress && score < 85 && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={`/quizzes/${chapter.id}`}
                          >
                            Practice Quiz
                          </Button>
                        )}

                        {!canAccess && score > 0 && (
                          <Alert variant="warning" className="p-2 mt-2">
                            <small>Score: {score}%. Need 85% to unlock next chapter.</small>
                          </Alert>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Tab>

        <Tab eventKey="performance" title="Performance Analysis">
          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5>Subject-wise Performance</h5>
                </Card.Header>
                <Card.Body>
                  {Object.entries(insights.subjectPerformance || {}).map(([subject, data]) => (
                    <div key={subject} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <strong>{subject}</strong>
                        <span>{Math.round(data.avgScore)}%</span>
                      </div>
                      <ProgressBar
                        now={data.avgScore}
                        variant={data.avgScore >= 80 ? 'success' : data.avgScore >= 60 ? 'warning' : 'danger'}
                      />
                      <small className="text-muted">
                        {data.chapters.length} chapters attempted
                      </small>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5>Learning Goals</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Complete all chapters
                      <Badge bg={insights.completionRate >= 100 ? 'success' : 'warning'}>
                        {insights.completionRate}%
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Average score  80%
                      <Badge bg={insights.avgScore >= 80 ? 'success' : 'warning'}>
                        {insights.avgScore}%
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Consistent practice
                      <Badge bg="info">
                        {insights.totalAttempts} attempts
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
