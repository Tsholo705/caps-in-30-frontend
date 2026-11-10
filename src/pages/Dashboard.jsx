import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../services/api.js";

const TIMER_CHOICES = [30, 60, 0];
const QUESTION_COUNTS = [1, 5, 10, 15, 20, 35, 50, 60];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState("All Topics");
  const [seconds, setSeconds] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(
    function () {
      if (loading || !user) return;

      api
        .getSubjects()
        .then(function (list) {
          setSubjects(list);

          if (list.length > 0) {
            setSubject(list[0]);
          }
        })
        .catch(function (error) {
          console.error("Could not load subjects:", error);
        });
    },
    [loading, user]
  );

  useEffect(
    function () {
      if (!subject || !user) return;

      api
        .getCategoriesBySubject(subject.id, user.grade)
        .then(function (list) {
          setCategories(list);
          setTopic("All Topics");
        })
        .catch(function (error) {
          console.error("Could not load categories:", error);
          setCategories([]);
        });
    },
    [subject, user.grade]
  );

  // Send visitors who are not logged in to the login page.

  // When the subject changes, reset the topic.
  function handleSubjectChange(subjectId) {
    const selectedSubject = subjects.find(function (item) {
      return item.id === Number(subjectId);
    });

    setSubject(selectedSubject || null);
    setTopic("All Topics");
  }

  function startQuiz() {
    if (topic === "Phonics and Spelling") {
      navigate("/spelling-practice");
      return;
    }

    api.saveQuizConfig({
      grade: user.grade,
      subject: subject.name,
      topic: topic,
      seconds: seconds,
      questionCount: questionCount,
    });
    navigate("/solo-quiz");
  }

  if (loading || !user) {
    return (
      <div className="page">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="dashboard-welcome">
        <h1>Welcome back, {user.name}!</h1>
        <p>Set up your quiz and see if you can beat the clock.</p>
        <span className="dashboard-grade-badge">Grade {user.grade}</span>
      </section>

      <section className="card-surface">
        <h2>Build your quiz</h2>

        <div className="dashboard-config-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="dash-subject">
              Subject
            </label>
            <select
              id="dash-subject"
              className="form-select"
              value={subject ? subject.id : ""}
              onChange={function (e) {
                handleSubjectChange(e.target.value);
              }}
            >
              {subjects.map(function (item) {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="dash-topic">
              Topic
            </label>
            <select
              id="dash-topic"
              className="form-select"
              value={topic}
              onChange={function (e) {
                setTopic(e.target.value);
              }}
            >
              <option value="All Topics">All Topics</option>

              {categories.map(function (item) {
                return (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Timer</span>
          <div className="option-group">
            {TIMER_CHOICES.map(function (value) {
              return (
                <button
                  key={value}
                  type="button"
                  className={
                    seconds === value ? "option-chip is-selected" : "option-chip"
                  }
                  onClick={function () {
                    setSeconds(value);
                  }}
                >
                  {value === 0 ? "No timer" : `${value} seconds`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Number of questions</span>
          <div className="option-group">
            {QUESTION_COUNTS.map(function (value) {
              return (
                <button
                  key={value}
                  type="button"
                  className={
                    questionCount === value ? "option-chip is-selected" : "option-chip"
                  }
                  onClick={function () {
                    setQuestionCount(value);
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dashboard-start-row">
          <Button variant="accent" large onClick={startQuiz}>
            Start Quiz
          </Button>
        </div>
      </section>

      <div className="dashboard-links">
        <Button
          variant="ghost"
          onClick={function () {
            navigate("/score-history");
          }}
        >
          View score history
        </Button>
        <Button
          variant="ghost"
          onClick={function () {
            navigate("/team-mode/setup");
          }}
        >
          Play team mode
        </Button>
      </div>
    </div>
  );
}
