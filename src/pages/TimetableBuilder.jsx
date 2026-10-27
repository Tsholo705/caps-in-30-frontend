import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { SUBJECTS, TOPICS } from "../data/questions.js";
import * as api from "../services/api.js";

// Turns a Date into "2026-10-26", built from local date parts so time
// zones cannot shift the day.
export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// A blank row to start with when adding a session by hand.
function emptySession() {
  return {
    id: 0, // 0 means "brand new session" — the service layer assigns real ids.
    date: toISODate(new Date()),
    startTime: "15:00",
    minutes: 30,
    subject: SUBJECTS[0],
    topic: "All Topics",
    notes: "",
  };
}

// One component for both "create a timetable" and "edit a timetable".
// When timetableId is given we are editing; otherwise we are creating.
export default function TimetableBuilder({ timetableId }) {
  const isEditing = Boolean(timetableId);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessions, setSessions] = useState(isEditing ? null : [emptySession()]);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Send visitors who are not logged in to the login page.
  useEffect(
    function () {
      if (!loading && !user) {
        navigate("/login");
      }
    },
    [loading, user, navigate]
  );

  // When editing, load the timetable first. Each loaded session keeps its id,
  // so saving an edit does not lose the "done" ticks.
  useEffect(
    function () {
      if (!isEditing || !user) return;
      api
        .getTimetable(timetableId)
        .then(function (timetable) {
          if (timetable.userId !== user.id) {
            setNotFound(true);
            return;
          }
          setName(timetable.name);
          setDescription(timetable.description);
          setSessions(
            timetable.sessions.length > 0
              ? timetable.sessions
              : [emptySession()]
          );
        })
        .catch(function () {
          setNotFound(true);
        });
    },
    [isEditing, timetableId, user]
  );

  if (loading || !user) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page">
        <div className="card-surface text-centre">
          <p>That timetable could not be found.</p>
          <Button
            onClick={function () {
              navigate("/timetables");
            }}
          >
            Back to timetables
          </Button>
        </div>
      </div>
    );
  }

  if (!sessions) {
    return (
      <div className="page">
        <p>Loading your timetable...</p>
      </div>
    );
  }

  // Change one field of one session row. Changing the subject resets the
  // topic, because topics belong to a subject.
  function updateSession(index, field, value) {
    setSessions(function (current) {
      const copy = current.slice();
      const session = { ...copy[index] };
      session[field] = value;
      if (field === "subject") {
        session.topic = "All Topics";
      }
      copy[index] = session;
      return copy;
    });
  }

  function addSession() {
    setSessions(function (current) {
      return current.concat([emptySession()]);
    });
  }

  function removeSession(index) {
    setSessions(function (current) {
      const copy = current.slice();
      copy.splice(index, 1);
      return copy;
    });
  }

  function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please give your timetable a name.");
      return;
    }
    if (sessions.length === 0) {
      setError("Add at least one study session.");
      return;
    }

    setError("");
    const savePromise = isEditing
      ? api.updateTimetable(timetableId, {
          name: name,
          description: description,
          sessions: sessions,
        })
      : api.createTimetable({
          userId: user.id,
          name: name,
          description: description,
          sessions: sessions,
        });

    savePromise
      .then(function (saved) {
        navigate("/timetables/$id", { params: { id: saved.id } });
      })
      .catch(function (saveError) {
        setError(saveError.message);
      });
  }

  return (
    <div className="page">
      <h1 className="page-title">
        {isEditing ? "Edit timetable" : "New study timetable"}
      </h1>
      <p className="page-subtitle">
        Give your plan a name, then add each study session: the date, time,
        subject and topic.
      </p>

      <form onSubmit={handleSave}>
        <div className="card-surface">
          <div className="dashboard-config-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="timetable-name">
                Timetable name
              </label>
              <input
                id="timetable-name"
                type="text"
                className="form-input"
                placeholder="e.g. Term 4 exam revision"
                value={name}
                onChange={function (e) {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="timetable-description">
                Description (optional)
              </label>
              <input
                id="timetable-description"
                type="text"
                className="form-input"
                placeholder="e.g. Getting ready for November exams"
                value={description}
                onChange={function (e) {
                  setDescription(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <h2 style={{ margin: "1.5rem 0 0.75rem 0" }}>Study sessions</h2>

        {sessions.map(function (session, index) {
          const topicChoices = ["All Topics"].concat(
            TOPICS[session.subject] || []
          );
          return (
            <div className="timetable-builder-row" key={index}>
              <div className="timetable-builder-row-head">
                <strong>Session {index + 1}</strong>
                <Button
                  variant="ghost"
                  onClick={function () {
                    removeSession(index);
                  }}
                >
                  Remove
                </Button>
              </div>

              <div className="timetable-builder-grid">
                <div className="form-field">
                  <label className="form-label" htmlFor={"session-date-" + index}>
                    Date
                  </label>
                  <input
                    id={"session-date-" + index}
                    type="date"
                    className="form-input"
                    value={session.date}
                    onChange={function (e) {
                      updateSession(index, "date", e.target.value);
                    }}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={"session-time-" + index}>
                    Start time
                  </label>
                  <input
                    id={"session-time-" + index}
                    type="time"
                    className="form-input"
                    value={session.startTime}
                    onChange={function (e) {
                      updateSession(index, "startTime", e.target.value);
                    }}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={"session-minutes-" + index}>
                    Minutes
                  </label>
                  <input
                    id={"session-minutes-" + index}
                    type="number"
                    min="5"
                    step="5"
                    className="form-input"
                    value={session.minutes}
                    onChange={function (e) {
                      updateSession(index, "minutes", Number(e.target.value));
                    }}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={"session-subject-" + index}>
                    Subject
                  </label>
                  <select
                    id={"session-subject-" + index}
                    className="form-select"
                    value={session.subject}
                    onChange={function (e) {
                      updateSession(index, "subject", e.target.value);
                    }}
                  >
                    {SUBJECTS.map(function (item) {
                      return (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={"session-topic-" + index}>
                    Topic
                  </label>
                  <select
                    id={"session-topic-" + index}
                    className="form-select"
                    value={session.topic}
                    onChange={function (e) {
                      updateSession(index, "topic", e.target.value);
                    }}
                  >
                    {topicChoices.map(function (item) {
                      return (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field form-field--wide">
                  <label className="form-label" htmlFor={"session-notes-" + index}>
                    Notes (optional)
                  </label>
                  <input
                    id={"session-notes-" + index}
                    type="text"
                    className="form-input"
                    placeholder="e.g. Do exercise 4 on page 52"
                    value={session.notes}
                    onChange={function (e) {
                      updateSession(index, "notes", e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="timetable-actions">
          <Button variant="ghost" onClick={addSession}>
            + Add another session
          </Button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="dashboard-links">
          <Button type="submit" variant="success" large>
            {isEditing ? "Save changes" : "Save timetable"}
          </Button>
          <Button
            variant="ghost"
            onClick={function () {
              navigate("/timetables");
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
