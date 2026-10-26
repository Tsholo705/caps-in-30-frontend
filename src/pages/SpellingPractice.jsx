
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../services/api.js";
import "../styles/SpellingPractice.css";
import Timer from "../components/Timer.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import Button from "../components/Button.jsx";

export default function SpellingPractice() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checkedCorrect, setCheckedCorrect] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loadingWords, setLoadingWords] = useState(true);
  const [error, setError] = useState("");

  // Load only spelling word IDs from the backend.
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    async function loadWords() {
      try {
        setLoadingWords(true);
        setError("");

        const list = await api.getSpellingWords(3, 7, 21);

        if (!cancelled) {
          setWords(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load spelling practice.");
        }
      } finally {
        if (!cancelled) {
          setLoadingWords(false);
        }
      }
    }

    loadWords();

    return () => {
      cancelled = true;
    };
  }, [loading, user, navigate]);

  async function handleCheckAnswer(event) {
    event.preventDefault();

    if (checking || checkedCorrect || !answer.trim()) return;

    const currentWord = words[currentIndex];

    if (!currentWord) return;

    try {
      setChecking(true);
      setFeedback("");

      const result = await api.checkSpellingAnswer(
        currentWord.id,
        answer
      );

      if (result.isCorrect) {
        setCheckedCorrect(true);
        setFeedback("Correct! Well done.");
      } else {
        setFeedback("Not quite. Try spelling it again.");
      }
    } catch (err) {
      setFeedback(
        err.message || "We couldn't check your answer. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  function handleNextWord() {
    if (!checkedCorrect) return;

    setCurrentIndex((previous) => previous + 1);
    setAnswer("");
    setFeedback("");
    setCheckedCorrect(false);
  }

  if (loading || loadingWords) {
    return (
      <div className="page">
        <p>Getting spelling practice ready...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page spelling-page">
        <h1>Spelling Practice</h1>
        <p role="alert">{error}</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="page spelling-page">
        <h1>No spelling words available</h1>
        <p>There are no words for this activity yet.</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  if (currentIndex >= words.length) {
    return (
      <div className="page spelling-page">
        <h1>Spelling Practice Complete!</h1>
        <p>
          Well done! You completed all {words.length} spelling words.
        </p>
        <button onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const progress = Math.round(
    (currentIndex / words.length) * 100
  );

  return (
    <div className="page">
      <div className="quiz-topbar">
        <span className="quiz-counter">
          Word {currentIndex + 1} of {words.length}
        </span>

        <span className="quiz-score-pill">
          Completed: {currentIndex}
        </span>
      </div>

      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="card-surface spelling-card">
        <h1>Spelling Practice</h1>

        <p className="spelling-instructions">
          Ask your parent to read word {currentIndex + 1} from
          the printed spelling list. Type the word you hear.
        </p>

        <form onSubmit={handleCheckAnswer}>
          <label className="form-label" htmlFor="spelling-answer">
            Your spelling
          </label>

          <input
            id="spelling-answer"
            className="form-input"
            type="text"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setFeedback("");
            }}
            placeholder="Type the word here"
            autoComplete="off"
            disabled={checking || checkedCorrect}
            autoFocus
          />

          <button
            type="submit"
            disabled={
              checking || checkedCorrect || !answer.trim()
            }
          >
            {checking ? "Checking..." : "Check Answer"}
          </button>
        </form>

        {feedback && (
          <p
            className={
              checkedCorrect
                ? "spelling-feedback spelling-correct"
                : "spelling-feedback"
            }
            role="status"
          >
            {feedback}
          </p>
        )}

        <button
          type="button"
          className="spelling-next-button"
          onClick={handleNextWord}
          disabled={!checkedCorrect}
        >
          {currentIndex === words.length - 1
            ? "Finish Practice"
            : "Next Word"}
        </button>
      </section>
    </div>
  );
}
