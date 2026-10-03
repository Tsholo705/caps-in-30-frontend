import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import * as api from "../services/api.js";

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ScoreHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    api.getScoreHistory().then(function (list) {
      setHistory(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Your score history</h1>
      <p className="page-subtitle">Every solo quiz you have played, newest first.</p>

      {loading ? <p>Loading scores...</p> : null}

      {!loading && history.length === 0 ? (
        <div className="card-surface text-centre">
          <p>No scores yet. Play your first quiz!</p>
          <Button
            onClick={function () {
              navigate("/dashboard");
            }}
          >
            Start a quiz
          </Button>
        </div>
      ) : null}

      {!loading && history.length > 0 ? (
        <div className="card-surface">
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map(function (entry) {
                  return (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.subject}</td>
                      <td>{entry.topic}</td>
                      <td>{entry.grade}</td>
                      <td>
                        {entry.correct} / {entry.total}
                      </td>
                      <td className="history-percentage">{entry.percentage}%</td>
                      <td>{entry.timeUsed}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="history-card-list">
            {history.map(function (entry) {
              return (
                <div className="history-card" key={entry.id}>
                  <div>
                    <strong>{entry.subject}</strong>
                    <div>{entry.topic}</div>
                    <small>
                      {formatDate(entry.date)} · Grade {entry.grade} · {entry.timeUsed}s
                    </small>
                  </div>
                  <div className="text-centre">
                    <div className="history-percentage">{entry.percentage}%</div>
                    <small>
                      {entry.correct}/{entry.total}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="dashboard-links">
        <Button
          variant="ghost"
          onClick={function () {
            navigate("/dashboard");
          }}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
