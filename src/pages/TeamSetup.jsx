import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { SUBJECTS, TOPICS } from "../data/questions.js";
import * as api from "../services/api.js";

const DEFAULT_NAMES = ["Team Lightning", "Team Thunder", "Team Rocket", "Team Blaze"];

export default function TeamSetup() {
  const navigate = useNavigate();

  const [grade, setGrade] = useState("7");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState("All Topics");
  const [teamCount, setTeamCount] = useState(2);
  const [rounds, setRounds] = useState(3);
  const [names, setNames] = useState(DEFAULT_NAMES.slice());

  function updateName(index, value) {
    setNames(function (previous) {
      const copy = previous.slice();
      copy[index] = value;
      return copy;
    });
  }

  function startGame() {
    const teams = [];
    for (let i = 0; i < teamCount; i++) {
      teams.push({
        name: names[i].trim() === "" ? DEFAULT_NAMES[i] : names[i].trim(),
        score: 0,
      });
    }

    api.saveTeamGame({
      grade: Number(grade),
      subject: subject,
      topic: topic,
      rounds: rounds,
      secondsPerTurn: 30,
      teams: teams,
      currentRound: 1,
      currentTeamIndex: 0,
      lastTurnPoints: 0,
      nextRound: 1,
      nextTeamIndex: 0,
      finished: false,
    });

    navigate("/team-mode/game");
  }

  const topicsForSubject = ["All Topics"].concat(TOPICS[subject]);
  const teamCountOptions = [2, 3, 4];
  const roundOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="page">
      <h1 className="page-title">Team Mode setup</h1>
      <p className="page-subtitle">
        One device, two to four teams, 30 seconds per turn. No account needed.
      </p>

      <section className="card-surface">
        <div className="team-setup-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="team-grade">
              Grade
            </label>
            <select
              id="team-grade"
              className="form-select"
              value={grade}
              onChange={function (e) {
                setGrade(e.target.value);
              }}
            >
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="team-subject">
              Subject
            </label>
            <select
              id="team-subject"
              className="form-select"
              value={subject}
              onChange={function (e) {
                setSubject(e.target.value);
                setTopic("All Topics");
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
            <label className="form-label" htmlFor="team-topic">
              Topic
            </label>
            <select
              id="team-topic"
              className="form-select"
              value={topic}
              onChange={function (e) {
                setTopic(e.target.value);
              }}
            >
              {topicsForSubject.map(function (item) {
                return (
                  <option key={item} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="team-rounds">
              Number of rounds
            </label>
            <select
              id="team-rounds"
              className="form-select"
              value={rounds}
              onChange={function (e) {
                setRounds(Number(e.target.value));
              }}
            >
              {roundOptions.map(function (value) {
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Number of teams</span>
          <div className="option-group">
            {teamCountOptions.map(function (value) {
              return (
                <button
                  key={value}
                  type="button"
                  className={teamCount === value ? "option-chip is-selected" : "option-chip"}
                  onClick={function () {
                    setTeamCount(value);
                  }}
                >
                  {value} teams
                </button>
              );
            })}
          </div>
        </div>

        <h2>Team names</h2>
        <div className="team-name-inputs">
          {names.slice(0, teamCount).map(function (name, index) {
            return (
              <div className="form-field" key={index}>
                <label className="form-label" htmlFor={"team-name-" + index}>
                  Team {index + 1}
                </label>
                <input
                  id={"team-name-" + index}
                  className="form-input"
                  value={name}
                  onChange={function (e) {
                    updateName(index, e.target.value);
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="dashboard-start-row">
          <Button variant="accent" large onClick={startGame}>
            Start Game
          </Button>
        </div>
      </section>
    </div>
  );
}
