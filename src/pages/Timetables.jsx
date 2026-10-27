import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../services/api.js";

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// The list of this learner's study timetables.
export default function Timetables() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [busy, setBusy] = useState(true);

  // Send visitors who are not logged in to the login page.
  useEffect(
    function () {
      if (!loading && !user) {
        navigate("/login");
      }
    },
    [loading, user, navigate]
  );

  // Load this learner's timetables once we know who they are.
  useEffect(
    function () {
      if (!user) return;
      api.getTimetables(user.id).then(function (list) {
        setTimetables(list);
        setBusy(false);
      });
    },
    [user]
  );

  function handleDelete(timetable) {
    const sure = window.confirm(
      'Delete "' + timetable.name + '"? This cannot be undone.'
    );
    if (!sure) return;
    api.deleteTimetable(timetable.id).then(function () {
      setTimetables(function (current) {
        return current.filter(function (t) {
          return t.id !== timetable.id;
        });
      });
    });
  }

  if (loading || !user) {
    return (
      <div className="page">
        <p>Loading your timetables...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Study timetable</h1>
      <p className="page-subtitle">
        Plan what to study and when, then tick each session off as you finish it.
      </p>

      <div className="timetable-actions">
        <Link to="/timetables/new" className="app-button app-button--success">
          + New timetable
        </Link>
        <Link to="/timetables/generator" className="app-button app-button--primary">
          Generate one for me
        </Link>
      </div>

      {busy ? <p>Loading your timetables...</p> : null}

      {!busy && timetables.length === 0 ? (
        <div className="card-surface text-centre">
          <p>
            You have no timetables yet. Build one yourself, or let the app
            spread your subjects over the week for you.
          </p>
        </div>
      ) : null}

      {!busy && timetables.length > 0 ? (
        <div className="timetable-grid">
          {timetables.map(function (timetable) {
            const progress = api.buildTimetableProgress(timetable);
            return (
              <div className="card-surface timetable-card" key={timetable.id}>
                <div className="timetable-card-head">
                  <h2 className="timetable-card-title">{timetable.name}</h2>
                  <span className="badge">{progress.percentage}% done</span>
                </div>

                {timetable.description ? (
                  <p className="timetable-card-description">
                    {timetable.description}
                  </p>
                ) : null}

                <div className="timetable-progress-bar">
                  <div
                    className="timetable-progress-fill"
                    style={{ width: progress.percentage + "%" }}
                  ></div>
                </div>
                <p className="timetable-meta">
                  {progress.completedSessions} of {progress.totalSessions}{" "}
                  sessions done · {progress.plannedMinutes} minutes planned ·
                  created {formatDate(timetable.createdDate)}
                </p>

                <div className="timetable-card-actions">
                  <Link
                    to="/timetables/$id"
                    params={{ id: timetable.id }}
                    className="app-button app-button--primary"
                  >
                    Open
                  </Link>
                  <Link
                    to="/timetables/$id_/edit"
                    params={{ id: timetable.id }}
                    className="app-button app-button--accent"
                  >
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={function () {
                      handleDelete(timetable);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
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
