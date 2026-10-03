import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import * as api from "../services/api.js";

function messageFor(percentage) {
  if (percentage >= 80) return "Outstanding! 🔥";
  if (percentage >= 60) return "Nice work! 👏";
  if (percentage >= 40) return "Getting there! 💪";
  return "Keep practising! 📚";
}

export default function SoloResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(function () {
    setResult(api.getQuizResult());
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="page">
        <p>Loading your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="page card-surface text-centre">
        <h1>No results yet</h1>
        <p>Play a quiz first and your score card will appear here.</p>
        <Button
          onClick={function () {
            navigate("/dashboard");
          }}
        >
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card-surface results-card">
        <h1 className="results-headline">{messageFor(result.percentage)}</h1>
        <p className="page-subtitle">
          {result.subject} · {result.topic} · Grade {result.grade}
        </p>

        <div className="results-score-ring">
          <strong>{result.percentage}%</strong>
          <span>
            {result.correct} / {result.total}
          </span>
        </div>

        <div className="results-stat-grid">
          <div className="results-stat">
            <span>Correct</span>
            <strong>{result.correct}</strong>
          </div>
          <div className="results-stat">
            <span>Incorrect</span>
            <strong>{result.incorrect}</strong>
          </div>
          <div className="results-stat">
            <span>Time used</span>
            <strong>{result.timeUsed}s</strong>
          </div>
          <div className="results-stat">
            <span>Answered</span>
            <strong>{result.answered}</strong>
          </div>
        </div>

        <div className="row-actions">
          <Button
            variant="accent"
            onClick={function () {
              navigate("/solo-quiz");
            }}
          >
            Play again
          </Button>
          <Button
            variant="success"
            onClick={function () {
              navigate("/score-history");
            }}
          >
            View score history
          </Button>
          <Button
            variant="ghost"
            onClick={function () {
              navigate("/dashboard");
            }}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
