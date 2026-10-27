import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toISODate } from "./TimetableBuilder.jsx";
import * as api from "../services/api.js";

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// The Monday of the week containing the given Date.
function startOfWeek(date) {
  const copy = new Date(date);
  const weekday = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - weekday);
  return copy;
}

function addDays(date, daysToAdd) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + daysToAdd);
  return copy;
}

// "Mon 26 Oct" style heading from an ISO date.
function formatDayHeading(isoDate) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Sorts a day's sessions by start time so the diary reads top to bottom.
function sortSessions(sessions) {
  return sessions.slice().sort(function (a, b) {
    return a.startTime < b.startTime ? -1 : 1;
  });
}

// The timetable view: a week overview plus a day view where each study
// session can be ticked off as it is finished.
export default function TimetableView({ timetableId }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState("week"); // "week" or "day"
  const [anchorDate, setAnchorDate] = useState(toISODate(new Date()));

  // Send visitors who are not logged in to the login page.
  useEffect(
    function () {
      if (!loading && !user) {
        navigate("/login");
      }
    },
    [loading, user, navigate]
  );

  // Load the timetable once we know who is asking.
  useEffect(
    function () {
      if (!user) return;
      api
        .getTimetable(timetableId)
        .then(function (found) {
          if (found.userId !== user.id) {
            setNotFound(true);
            return;
          }
          setTimetable(found);
        })
        .catch(function () {
          setNotFound(true);
        });
    },
    [timetableId, user]
  );

  // Tick (or untick) one session and keep the copy on screen in step.
  function toggleSession(session) {
    api
      .updateSessionCompletion(timetable.id, session.id, !session.isComplete)
      .then(function (updated) {
        setTimetable(function (current) {
          const copy = { ...current };
          copy.sessions = current.sessions.map(function (item) {
            return item.id === updated.id ? updated : item;
          });
          return copy;
        });
      });
  }

  // Step the calendar backwards or forwards. The week view moves a week at
  // a time; the day view moves a day at a time.
  function stepAnchor(direction) {
    const amount = viewMode === "week" ? direction * 7 : direction;
    setAnchorDate(function (current) {
      return toISODate(
        addDays(new Date(current + "T00:00:00"), amount)
      );
    });
  }

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

  if (!timetable) {
    return (
      <div className="page">
        <p>Loading your timetable...</p>
      </div>
    );
  }

  const progress = api.buildTimetableProgress(timetable);

  // Group the sessions by their date so both views can look them up.
  const sessionsByDate = {};
  timetable.sessions.forEach(function (session) {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  // The seven dates shown in the week view.
  const weekDates = [];
  const weekStart = startOfWeek(new Date(anchorDate + "T00:00:00"));
  for (let i = 0; i < 7; i++) {
    weekDates.push(toISODate(addDays(weekStart, i)));
  }

  const todayISO = toISODate(new Date());
  const rangeLabel =
    viewMode === "week"
      ? formatDayHeading(weekDates[0]) +
        " – " +
        formatDayHeading(weekDates[6])
      : formatDayHeading(anchorDate);

  return (
    <div className="page">
      <div className="timetable-card-head">
        <div>
          <h1 className="page-title">{timetable.name}</h1>
          {timetable.description ? (
            <p className="timetable-card-description">
              {timetable.description}
            </p>
          ) : null}
        </div>
        <Link
          to="/timetables/$id_/edit"
          params={{ id_: timetable.id }}
          className="app-button app-button--accent"
        >
          Edit
        </Link>
      </div>

      {/* ---------- progress summary ---------- */}
      <section className="card-surface">
        <h2>Progress</h2>
        <div className="timetable-progress-bar">
          <div
            className="timetable-progress-fill"
            style={{ width: progress.percentage + "%" }}
          ></div>
        </div>
        <p className="timetable-progress-label">
          {progress.percentage}% done · {progress.completedSessions} of{" "}
          {progress.totalSessions} sessions · {progress.completedMinutes} of{" "}
          {progress.plannedMinutes} minutes studied
        </p>
        {progress.perSubject.length > 0 ? (
          <div className="timetable-subject-progress">
            {progress.perSubject.map(function (subject) {
              return (
                <div className="timetable-subject-row" key={subject.subject}>
                  <strong>{subject.subject}</strong>
                  <div className="timetable-progress-bar timetable-subject-bar">
                    <div
                      className="timetable-progress-fill"
                      style={{ width: subject.percentage + "%" }}
                    ></div>
                  </div>
                  <span>
                    {subject.completed}/{subject.total}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* ---------- week / day toolbar ---------- */}
      <div className="timetable-toolbar">
        <div className="timetable-view-toggle">
          <button
            type="button"
            className={
              viewMode === "week" ? "option-chip is-selected" : "option-chip"
            }
            onClick={function () {
              setViewMode("week");
            }}
          >
            Week
          </button>
          <button
            type="button"
            className={
              viewMode === "day" ? "option-chip is-selected" : "option-chip"
            }
            onClick={function () {
              setViewMode("day");
            }}
          >
            Day
          </button>
        </div>

        <div className="timetable-day-nav">
          <Button variant="ghost" onClick={function () { stepAnchor(-1); }}>
            ← Previous
          </Button>
          <span className="timetable-range-label">{rangeLabel}</span>
          <Button variant="ghost" onClick={function () { stepAnchor(1); }}>
            Next →
          </Button>
          <Button
            variant="ghost"
            onClick={function () {
              setAnchorDate(todayISO);
            }}
          >
            Today
          </Button>
        </div>
      </div>

      {/* ---------- week view ---------- */}
      {viewMode === "week" ? (
        <div className="timetable-week-grid">
          {weekDates.map(function (date, index) {
            const daySessions = sortSessions(sessionsByDate[date] || []);
            const isToday = date === todayISO;
            return (
              <div
                className={
                  isToday
                    ? "timetable-week-day timetable-week-day--today"
                    : "timetable-week-day"
                }
                key={date}
              >
                <p className="timetable-week-day-title">
                  {WEEKDAY_NAMES[index]}
                  {isToday ? " · today" : ""}
                </p>
                {daySessions.length === 0 ? (
                  <p className="timetable-week-day-empty">Nothing planned</p>
                ) : (
                  daySessions.map(function (session) {
                    return (
                      <p
                        className={
                          session.isComplete
                            ? "timetable-week-session timetable-week-session--done"
                            : "timetable-week-session"
                        }
                        key={session.id}
                      >
                        {session.startTime} · {session.subject}
                        {session.isComplete ? " ✓" : ""}
                      </p>
                    );
                  })
                )}
                <button
                  type="button"
                  className="timetable-open-day"
                  onClick={function () {
                    setAnchorDate(date);
                    setViewMode("day");
                  }}
                >
                  Open day
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ---------- day view ---------- */}
      {viewMode === "day" ? (
        (sessionsByDate[anchorDate] || []).length === 0 ? (
          <div className="card-surface text-centre">
            <p>No study sessions planned for this day. Enjoy the break!</p>
          </div>
        ) : (
          <div className="timetable-session-list">
            {sortSessions(sessionsByDate[anchorDate]).map(function (session) {
              return (
                <div
                  className={
                    session.isComplete
                      ? "timetable-session timetable-session--done"
                      : "timetable-session"
                  }
                  key={session.id}
                >
                  <button
                    type="button"
                    className={
                      session.isComplete
                        ? "timetable-session-tick timetable-session-tick--done"
                        : "timetable-session-tick"
                    }
                    aria-label={
                      session.isComplete
                        ? "Mark as not done"
                        : "Mark as done"
                    }
                    onClick={function () {
                      toggleSession(session);
                    }}
                  >
                    {session.isComplete ? "✓" : ""}
                  </button>

                  <div className="timetable-session-main">
                    <div className="timetable-session-subject">
                      {session.subject}
                    </div>
                    <div className="timetable-session-meta">
                      {session.topic} · {session.minutes} minutes
                    </div>
                    {session.notes ? (
                      <div className="timetable-session-notes">
                        {session.notes}
                      </div>
                    ) : null}
                  </div>

                  <div className="timetable-session-side">
                    <span className="timetable-session-time-badge">
                      {session.startTime}
                    </span>
                    {session.isComplete ? (
                      <span className="timetable-session-done-badge">
                        Done!
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : null}

      <div className="dashboard-links">
        <Button
          variant="ghost"
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
