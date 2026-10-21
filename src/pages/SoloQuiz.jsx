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

  // Stores each answer immediately so the final result has the details.
  const answersRef = useRef([]);
  const finishedRef = useRef(false);
  const loadStartedRef = useRef(false);

  // 1. Load the learner's quiz configuration and questions.
  useEffect(
    function () {
      if (loading) return;

      if (!user) {
        navigate("/login");
        return;
      }
      if (loadStartedRef.current) return;
      loadStartedRef.current = true;

      const savedConfig = api.getQuizConfig();

      if (!savedConfig) {
        navigate("/dashboard");
        return;
      }

      setConfig(savedConfig);
      setSecondsLeft(savedConfig.seconds);

      // A retry round supplies its questions through localStorage.
      const retryData = localStorage.getItem("caps30_retry_questions");

      if (retryData) {
        localStorage.removeItem("caps30_retry_questions");

        try {
          const retryQuestions = JSON.parse(retryData);

          if (Array.isArray(retryQuestions) && retryQuestions.length > 0) {
            answersRef.current = [];
            setQuestions(retryQuestions);
            setReady(true);
            return;
          }
        } catch (error) {
          console.error("Could not load retry questions:", error);
        }
      }

      // If this isn't a retry round, load a normal quiz.
      api
        .getQuestions(
          savedConfig.grade,
          savedConfig.subject,
          savedConfig.topic,
          savedConfig.questionCount
        )
        .then(function (list) {
          answersRef.current = [];
          setQuestions(list);
          setReady(true);
        })
        .catch(function (error) {
          console.error("Could not load questions:", error);
          setQuestions([]);
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
      const allAnswered =
        questions.length > 0 && currentIndex >= questions.length;

      if (!timeIsUp && !allAnswered) return;

      finishedRef.current = true;

      // Include every question the learner missed, including unanswered ones.
      const wrongAnswers = questions
        .map(function (question, questionIndex) {
          const recordedAnswer = answersRef.current.find(function (answer) {
            return answer.questionIndex === questionIndex;
          });

          if (recordedAnswer && recordedAnswer.isCorrect) {
            return null;
          }

          const options = question.options ?? [];
          const correctIndex = question.correctIndex;

          return {
            question,
            questionText: question.text ?? "Question",
            selectedAnswer: recordedAnswer
              ? recordedAnswer.selectedAnswer
              : null,
            correctAnswer:
              options[correctIndex] ?? "Correct answer unavailable",
            unanswered: !recordedAnswer,
          };
        })
        .filter(Boolean);

      const total = questions.length;
      const percentage =
        total === 0 ? 0 : Math.round((correctCount / total) * 100);

      const result = {
        id: "run-" + Date.now(),
        date: new Date().toISOString(),
        grade: config.grade,
        subject: config.subject,
        topic: config.topic,
        correct: correctCount,
        incorrect: total - correctCount,
        total,
        percentage,
        timeUsed: config.seconds - secondsLeft,
        answered: currentIndex,
        wrongAnswers,
      };

      api.saveQuizResult(result);

      api
        .addScoreToHistory(result)
        .then(function () {
          navigate("/solo-results");
        })
        .catch(function (error) {
          console.error("Could not save score:", error);
          navigate("/solo-results");
        });
    },
    [
      secondsLeft,
      currentIndex,
      ready,
      config,
      questions,
      correctCount,
      navigate,
    ]
  );

  // 4. Record the selected answer before moving to the next question.
  function handleAnswer(optionIndex) {
    const question = questions[currentIndex];

    if (!question || finishedRef.current) return;

    const options = question.options ?? [];
    const isCorrect = optionIndex === question.correctIndex;

    answersRef.current.push({
      questionIndex: currentIndex,
      selectedIndex: optionIndex,
      selectedAnswer: options[optionIndex] ?? "Unknown answer",
      isCorrect,
    });

    if (isCorrect) {
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
        <p>
          We don't have prototype questions for that choice. Try another topic.
        </p>
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
        <div
          className="quiz-progress-fill"
          style={{ width: progress + "%" }}
        />
      </div>

      <QuizQuestion question={question} onAnswer={handleAnswer} />
    </div>
  );
}
