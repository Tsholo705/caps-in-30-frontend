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

  function retryWrongQuestions() {
    const wrongAnswers = result?.wrongAnswers ?? [];

    const questionsToRetry = wrongAnswers
      .map(function (item) {
        return item.question;
      })
      .filter(Boolean);

    if (questionsToRetry.length === 0) return;

    localStorage.setItem(
      "caps30_retry_questions",
      JSON.stringify(questionsToRetry)
    );

    navigate("/solo-quiz");
  }

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

  const wrongAnswers = result.wrongAnswers ?? [];

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

      <section className="card-surface wrong-answers-section">
        <h2>Review your answers</h2>

        {wrongAnswers.length === 0 ? (
          <div>
            <p>Excellent work! You didn't get any questions wrong. 🎉</p>
          </div>
        ) : (
          <>
            <p>
              Review these {wrongAnswers.length} question
              {wrongAnswers.length === 1 ? "" : "s"}, then try them again.
            </p>

            <div className="wrong-answer-list">
              {wrongAnswers.map(function (item, index) {
                return (
                  <article className="wrong-answer-card" key={index}>
                    <h3>
                      Question {index + 1}: {item.questionText}
                    </h3>

                    <p>
                      <strong>Your answer:</strong>{" "}
                      {item.unanswered
                        ? "You didn't answer this question."
                        : item.selectedAnswer}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="row-actions">
              <Button variant="accent" onClick={retryWrongQuestions}>
                Retry wrong questions ({wrongAnswers.length})
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
