import React, { useState } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';

const Quizzes = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes

  return (
    <div className="p-4">
      <Card>
        <Card.Header>
          <ProgressBar now={(currentQuestion + 1) * 20} label={`${currentQuestion + 1}/5`} />
          <div className="d-flex justify-content-between">
            <h5>Quiz Question {currentQuestion + 1}</h5>
            <span>Time: {Math.floor(timeLeft/60)}:{timeLeft%60}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <h6>Sample question about traffic rules?</h6>
          <div className="mt-3">
            <div className="form-check">
              <input className="form-check-input" type="radio" name="answer" />
              <label className="form-check-label">Answer 1</label>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="primary" onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              Next Question
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Quizzes;