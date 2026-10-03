import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../components/Timer.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../services/api.js";

export default function SoloQuiz() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [ready, setReady] = useState(false);

  // Makes sure we only finish the quiz once.
  const finishedRef = useRef(false);

  // 1. Load the config the learner chose on the dashboard and fetch questions.
  useEffect(
    function () {
      if (loading) return;
      if (!user) {
        navigate("/login");
        return;
      }

      const savedConfig = api.getQuizConfig();
      if (!savedConfig) {
        navigate("/dashboard");
        return;
      }

      setConfig(savedConfig);
      setSecondsLeft(savedConfig.seconds);

      api
        .getQuestions(
          savedConfig.grade,
          savedConfig.subject,
          savedConfig.topic,
          savedConfig.questionCount
        )
        .then(function (list) {
          setQuestions(list);
          setReady(true);
        });
    },
    [loading, user, navigate]
  );

  // 2. Count down one second at a time.
  useEffect(
    function () {
      if (!ready || questions.length === 0) return undefined;

      const intervalId = setInterval(function () {
        setSecondsLeft(function (previous) {
          if (previous <= 1) return 0;
          return previous - 1;
        });
      }, 1000);

      return function () {
        clearInterval(intervalId);
      };
    },
    [ready, questions.length]
  );

  // 3. Finish when the time runs out or all questions are answered.
  useEffect(
    function () {
      if (!ready || !config || finishedRef.current) return;

      const timeIsUp = secondsLeft <= 0;
      const allAnswered = questions.length > 0 && currentIndex >= questions.length;
      if (!timeIsUp && !allAnswered) return;

      finishedRef.current = true;

      const total = questions.length;
      const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
      const result = {
        id: "run-" + Date.now(),
        date: new Date().toISOString(),
        grade: config.grade,
        subject: config.subject,
        topic: config.topic,
        correct: correctCount,
        incorrect: total - correctCount,
        total: total,
        percentage: percentage,
        timeUsed: config.seconds - secondsLeft,
        answered: currentIndex,
      };

      api.saveQuizResult(result);

      api.addScoreToHistory(result)
        .then(function () {
          navigate("/solo-results");
        })
        .catch(function (error) {
          console.error("Could not save score:", error);
          navigate("/solo-results");
        });
    },
    [secondsLeft, currentIndex, ready, config, questions.length, correctCount, navigate]
  );

  function handleAnswer(optionIndex) {
    const question = questions[currentIndex];
    if (optionIndex === question.correctIndex) {
      setCorrectCount(function (previous) {
        return previous + 1;
      });
    }
    setCurrentIndex(function (previous) {
      return previous + 1;
    });
  }

  if (!ready || !config) {
    return (
      <div className="page">
        <p>Getting your questions ready...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page quiz-empty card-surface">
        <h1>No questions yet</h1>
        <p>We don't have prototype questions for that choice. Try another topic.</p>
        <Button
          onClick={function () {
            navigate("/dashboard");
          }}
        >
          Back to dashboard
        </Button>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) {
    return (
      <div className="page">
        <p>Adding up your score...</p>
      </div>
    );
  }

  const progress = ((currentIndex / questions.length) * 100).toFixed(0);

  return (
    <div className="page">
      <div className="quiz-topbar">
        <span className="quiz-counter">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <Timer secondsLeft={secondsLeft} warningAt={10} />
        <span className="quiz-score-pill">Score: {correctCount}</span>
      </div>

      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: progress + "%" }} />
      </div>

      <QuizQuestion question={question} onAnswer={handleAnswer} />
    </div>
  );
}
