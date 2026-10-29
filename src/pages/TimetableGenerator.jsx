import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { SUBJECTS, TOPICS } from "../data/questions.js";
import { toISODate } from "./TimetableBuilder.jsx";
import * as api from "../services/api.js";

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SESSION_COUNT_CHOICES = [1, 2, 3, 4, 5];
const MINUTES_CHOICES = [20, 30, 45, 60];
const BREAK_MINUTES = 15; // rest between two sessions on the same day.
const MAX_SESSIONS_PER_DAY = 3; // no more than three blocks on one day.

// Turns "15:00" plus a number of minutes into a new "15:45" style time.
function addMinutesToTime(time, minutesToAdd) {
  const parts = time.split(":");
  const totalMinutes = Number(parts[0]) * 60 + Number(parts[1]) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return (
    String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0")
  );
}

// Adds days to a Date and returns the new Date.
function addDays(date, daysToAdd) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + daysToAdd);
  return copy;
}

// The first date on or after startDate that falls on the given weekday
// (0 = Monday ... 6 = Sunday).
function firstOccurrence(startDate, weekdayIndex) {
  const startWeekday = (startDate.getDay() + 6) % 7;
  const daysAhead = (weekdayIndex - startWeekday + 7) % 7;
  return addDays(startDate, daysAhead);
}

// The guided generator: the learner picks subjects, how many sessions per
// subject, and which days they study. The app spreads the sessions over
// those days and builds the timetable for them.
export default function TimetableGenerator() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [topicFocus, setTopicFocus] = useState({});
  const [sessionsPerSubject, setSessionsPerSubject] = useState(2);
  const [minutesPerSession, setMinutesPerSession] = useState(30);
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [studyDays, setStudyDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri
  const [dailyStartTime, setDailyStartTime] = useState("15:00");
  const [timetableName, setTimetableName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Toggle one subject on or off. A new subject starts on "mixed", which
  // means its sessions rotate through all of that subject's topics.
  function toggleSubject(subject) {
    setSelectedSubjects(function (current) {
      if (current.indexOf(subject) !== -1) {
        return current.filter(function (item) {
          return item !== subject;
        });
      }
      return current.concat([subject]);
    });
    setTopicFocus(function (current) {
      const copy = { ...current };
      if (copy[subject] === undefined) {
        copy[subject] = "mixed";
      } else {
        delete copy[subject];
      }
      return copy;
    });
  }

  // Toggle one study day (0 = Monday) on or off.
  function toggleStudyDay(dayIndex) {
    setStudyDays(function (current) {
      if (current.indexOf(dayIndex) !== -1) {
        return current.filter(function (item) {
          return item !== dayIndex;
        });
      }
      return current.concat([dayIndex]).sort();
    });
  }

  // Works out every session the generator would create from the current
  // choices, sorted by date and time. Used for both the preview and saving.
  function buildPlan() {
    if (selectedSubjects.length === 0 || studyDays.length === 0) {
      return [];
    }

    // One template per session, round-robin over the subjects so the same
    // subject does not fill one whole day.
    const templates = [];
    for (let round = 0; round < sessionsPerSubject; round++) {
      selectedSubjects.forEach(function (subject) {
        templates.push({ subject: subject });
      });
    }

    // Give each session of a subject the next topic in line (or the one
    // focus topic the learner picked for that subject).
    const topicCounter = {};
    templates.forEach(function (template) {
      const focus = topicFocus[template.subject] || "mixed";
      topicCounter[template.subject] =
        (topicCounter[template.subject] || 0) + 1;
      if (focus === "mixed") {
        const topics = TOPICS[template.subject] || [];
        template.topic =
          topics.length > 0
            ? topics[(topicCounter[template.subject] - 1) % topics.length]
            : "All Topics";
      } else {
        template.topic = focus;
      }
    });

    // Spread the templates over the chosen study days, at most three
    // blocks per day. After three blocks the plan moves to the next week.
    const startDateObj = new Date(startDate + "T00:00:00");
    const firstDates = studyDays.map(function (weekdayIndex) {
      return firstOccurrence(startDateObj, weekdayIndex);
    });

    const sessions = templates.map(function (template, index) {
      const daySlot = index % studyDays.length;
      const slotNumber = Math.floor(index / studyDays.length);
      const slotInDay = slotNumber % MAX_SESSIONS_PER_DAY;
      const weeksAhead = Math.floor(slotNumber / MAX_SESSIONS_PER_DAY);

      const sessionDate = addDays(firstDates[daySlot], weeksAhead * 7);
      return {
        date: toISODate(sessionDate),
        startTime: addMinutesToTime(
          dailyStartTime,
          slotInDay * (minutesPerSession + BREAK_MINUTES)
        ),
        minutes: minutesPerSession,
        subject: template.subject,
        topic: template.topic,
        notes: "",
      };
    });

    // Store the sessions in date order so the timetable reads naturally.
    sessions.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.startTime < b.startTime ? -1 : 1;
    });

    return sessions;
  }

  // Group the plan by date so the preview reads like a diary.
  function groupPlanByDate(plan) {
    const grouped = [];
    plan.forEach(function (session) {
      const existingDay = grouped.find(function (day) {
        return day.date === session.date;
      });
      if (existingDay) {
        existingDay.sessions.push(session);
      } else {
        grouped.push({ date: session.date, sessions: [session] });
      }
    });
    return grouped;
  }

  function handleGenerate() {
    if (selectedSubjects.length === 0) {
      setError("Pick at least one subject to plan.");
      return;
    }
    if (studyDays.length === 0) {
      setError("Pick at least one study day.");
      return;
    }

    setError("");
    setSaving(true);
    api
      .createTimetable({
        userId: user.id,
        name: timetableName.trim() || "My generated study plan",
        description:
          "Generated by the study planner: " +
          selectedSubjects.join(", ") +
          ".",
        sessions: buildPlan(),
      })
      .then(function (saved) {
        console.log("Saved timetable response:", saved);

        if (!saved || !saved.id) {
          setError("Timetable was saved, but its ID was not returned.");
          setSaving(false);
          return;
        }

        navigate("/timetables/" + saved.id);
      })
      .catch(function (saveError) {
        setError(saveError.message);
        setSaving(false);
      });
  }

  const plan = buildPlan();
  const groupedPlan = groupPlanByDate(plan);

  if (loading || !user) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page timetable-generator">
      <h1 className="page-title">Generate a study plan</h1>
      <p className="page-subtitle">
        Answer a few questions and the planner spreads your subjects over the
        week for you.
      </p>

      <section className="timetable-generator-section card-surface">
        <h2>Which subjects do you want to study?</h2>
        <div className="option-group">
          {SUBJECTS.map(function (subject) {
            const isSelected = selectedSubjects.indexOf(subject) !== -1;
            return (
              <button
                key={subject}
                type="button"
                className={
                  isSelected ? "option-chip is-selected" : "option-chip"
                }
                onClick={function () {
                  toggleSubject(subject);
                }}
              >
                {subject}
              </button>
            );
          })}
        </div>

        {selectedSubjects.map(function (subject) {
          const focus = topicFocus[subject] || "mixed";
          const topicChoices = ["mixed"].concat(TOPICS[subject] || []);
          return (
            <div className="timetable-topic-group" key={subject}>
              <h3>Topics for {subject}</h3>
              <div className="option-group">
                {topicChoices.map(function (choice) {
                  const isSelected = focus === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      className={
                        isSelected ? "option-chip is-selected" : "option-chip"
                      }
                      onClick={function () {
                        setTopicFocus(function (current) {
                          const copy = { ...current };
                          copy[subject] = choice;
                          return copy;
                        });
                      }}
                    >
                      {choice === "mixed" ? "Mix all topics" : choice}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="timetable-generator-section card-surface">
        <h2>How much time can you give it?</h2>

        <div className="form-field">
          <span className="form-label">Sessions per subject</span>
          <div className="option-group">
            {SESSION_COUNT_CHOICES.map(function (value) {
              return (
                <button
                  key={value}
                  type="button"
                  className={
                    sessionsPerSubject === value
                      ? "option-chip is-selected"
                      : "option-chip"
                  }
                  onClick={function () {
                    setSessionsPerSubject(value);
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Minutes per session</span>
          <div className="option-group">
            {MINUTES_CHOICES.map(function (value) {
              return (
                <button
                  key={value}
                  type="button"
                  className={
                    minutesPerSession === value
                      ? "option-chip is-selected"
                      : "option-chip"
                  }
                  onClick={function () {
                    setMinutesPerSession(value);
                  }}
                >
                  {value} minutes
                </button>
              );
            })}
          </div>
        </div>

        <div className="dashboard-config-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="generator-start-date">
              Start from
            </label>
            <input
              id="generator-start-date"
              type="date"
              className="form-input"
              value={startDate}
              onChange={function (e) {
                setStartDate(e.target.value);
              }}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="generator-start-time">
              Start studying at
            </label>
            <input
              id="generator-start-time"
              type="time"
              className="form-input"
              value={dailyStartTime}
              onChange={function (e) {
                setDailyStartTime(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Which days do you study?</span>
          <div className="option-group">
            {WEEKDAY_NAMES.map(function (name, index) {
              const isSelected = studyDays.indexOf(index) !== -1;
              return (
                <button
                  key={name}
                  type="button"
                  className={
                    isSelected ? "option-chip is-selected" : "option-chip"
                  }
                  onClick={function () {
                    toggleStudyDay(index);
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="generator-name">
            Name your timetable (optional)
          </label>
          <input
            id="generator-name"
            type="text"
            className="form-input"
            placeholder="e.g. Term 4 exam revision"
            value={timetableName}
            onChange={function (e) {
              setTimetableName(e.target.value);
            }}
          />
        </div>
      </section>

      {groupedPlan.length > 0 ? (
        <section className="timetable-generator-section card-surface">
          <h2>Preview of your plan</h2>
          <div className="timetable-preview-list">
            {groupedPlan.map(function (day) {
              return (
                <div key={day.date}>
                  <p className="timetable-preview-day">
                    {new Date(day.date + "T00:00:00").toLocaleDateString(
                      "en-ZA",
                      { weekday: "long", day: "numeric", month: "short" }
                    )}
                  </p>
                  {day.sessions.map(function (session, index) {
                    return (
                      <p key={index}>
                        {session.startTime} · {session.subject} ·{" "}
                        {session.topic} · {session.minutes} minutes
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="dashboard-links">
        <Button
          variant="success"
          large
          onClick={handleGenerate}
          disabled={saving}
        >
          {saving ? "Creating your plan..." : "Generate my timetable"}
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
    </div>
  );
}
