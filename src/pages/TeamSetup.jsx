import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import * as api from "../services/api.js";

const DEFAULT_NAMES = [
  "Team Lightning",
  "Team Thunder",
  "Team Rocket",
  "Team Blaze",
];

export default function TeamSetup() {
  const navigate = useNavigate();

  const [grade, setGrade] = useState("7");
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);

  const [subject, setSubject] = useState(null);
  const [category, setCategory] = useState(null);

  const [teamCount, setTeamCount] = useState(2);
  const [rounds, setRounds] = useState(3);
  const [names, setNames] = useState(DEFAULT_NAMES.slice());

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // Load subjects from the backend
  useEffect(function () {
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
        setError("Could not load subjects.");
      })
      .finally(function () {
        setLoadingSubjects(false);
      });
  }, []);

  // Load categories whenever the subject changes
  useEffect(
    function () {
      if (!subject) return;

      setLoadingCategories(true);
      setCategory(null);

      api
        .getCategoriesBySubject(subject.id)
        .then(function (list) {
          setCategories(list);
        })
        .catch(function (error) {
          console.error("Could not load categories:", error);
          setCategories([]);
          setError("Could not load topics.");
        })
        .finally(function () {
          setLoadingCategories(false);
        });
    },
    [subject]
  );

  function updateName(index, value) {
    setNames(function (previous) {
      const copy = previous.slice();
      copy[index] = value;
      return copy;
    });
  }

  async function startGame() {
    setError("");

    if (!subject) {
      setError("Please select a subject.");
      return;
    }

    if (!category) {
      setError("Please select a topic.");
      return;
    }

    setStarting(true);

    try {
      // First get the cards from the backend.
      const cards = await api.getTeamCards(
        Number(grade),
        subject.id,
        category.id
      );

      if (cards.length === 0) {
        setError("There are no team cards available for this selection.");
        setStarting(false);
        return;
      }

      const teams = [];

      for (let i = 0; i < teamCount; i++) {
        teams.push({
          name:
            names[i].trim() === ""
              ? DEFAULT_NAMES[i]
              : names[i].trim(),
          score: 0,
        });
      }

      // Save the game itself to the backend.
      const savedGame = await api.saveTeamGame({
        grade: Number(grade),
        subject: subject.name,
        topic: category.name,
        numberOfTeams: teamCount,
        numberOfRounds: rounds,
        currentTeam: 1,
        currentRound: 1,
        isFinished: false,
      });

      // Keep the cards and team names locally for the current game.
      // The actual game state is stored in the backend.
      sessionStorage.setItem(
        "caps30_team_cards",
        JSON.stringify(cards)
      );

      sessionStorage.setItem(
        "caps30_team_names",
        JSON.stringify(teams)
      );

      sessionStorage.setItem(
        "caps30_team_game_id",
        String(savedGame.id)
      );

      navigate("/team-mode/game");
    } catch (error) {
      console.error("Could not start team game:", error);
      setError(error.message || "Could not start team game.");
      setStarting(false);
    }
  }

  const teamCountOptions = [2, 3, 4];

  const roundOptions = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
  ];

  return (
    <div className="page">
      <h1 className="page-title">Team Mode setup</h1>

      <p className="page-subtitle">
        One device, two to four teams, 30 seconds per turn. No account needed.
      </p>

      <section className="card-surface">
        {error ? (
          <p className="form-banner-error">{error}</p>
        ) : null}

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
              value={subject ? subject.id : ""}
              disabled={loadingSubjects}
              onChange={function (e) {
                const selected = subjects.find(function (item) {
                  return item.id === Number(e.target.value);
                });

                setSubject(selected || null);
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
            <label className="form-label" htmlFor="team-topic">
              Topic
            </label>

            <select
              id="team-topic"
              className="form-select"
              value={category ? category.id : ""}
              disabled={loadingCategories || categories.length === 0}
              onChange={function (e) {
                const selected = categories.find(function (item) {
                  return item.id === Number(e.target.value);
                });

                setCategory(selected || null);
              }}
            >
              <option value="">
                {loadingCategories
                  ? "Loading topics..."
                  : "Select a topic"}
              </option>

              {categories.map(function (item) {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
                  className={
                    teamCount === value
                      ? "option-chip is-selected"
                      : "option-chip"
                  }
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
                <label
                  className="form-label"
                  htmlFor={"team-name-" + index}
                >
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
          <Button
            variant="accent"
            large
            onClick={startGame}
            disabled={starting || loadingSubjects || loadingCategories}
          >
            {starting ? "Starting game..." : "Start Game"}
          </Button>
        </div>
      </section>
    </div>
  );
}