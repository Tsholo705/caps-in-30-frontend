import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamCard from "../components/TeamCard.jsx";
import Button from "../components/Button.jsx";
import * as api from "../services/api.js";

export default function TeamGame() {
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [deck, setDeck] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [teamNames, setTeamNames] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [turnPoints, setTurnPoints] = useState(0);
  const [turnOver, setTurnOver] = useState(false);

  // Load the backend game and the temporary session data.
  useEffect(
    function () {
      async function loadGame() {
        try {
          const savedGame = await api.getTeamGame();

          if (!savedGame) {
            navigate("/team-mode/setup");
            return;
          }

          const savedCards = JSON.parse(
            sessionStorage.getItem("caps30_team_cards") || "[]"
          );

          const savedNames = JSON.parse(
            sessionStorage.getItem("caps30_team_names") || "[]"
          );

          const savedScores = JSON.parse(
            sessionStorage.getItem("caps30_team_scores") || "[]"
          );

          if (savedCards.length === 0 || savedNames.length === 0) {
            navigate("/team-mode/setup");
            return;
          }

          setGame(savedGame);
          setDeck(savedCards);
          setTeamNames(savedNames);
          setScores(savedScores);
          setSecondsLeft(30);
        } catch (error) {
          console.error("Could not load team game:", error);
          navigate("/team-mode/setup");
        }
      }

      loadGame();
    },
    [navigate]
  );

  // Countdown for the current team's turn.
  useEffect(
    function () {
      if (!game || turnOver) return undefined;

      const intervalId = setInterval(function () {
        setSecondsLeft(function (previous) {
          if (previous <= 1) {
            return 0;
          }

          return previous - 1;
        });
      }, 1000);

      return function () {
        clearInterval(intervalId);
      };
    },
    [game, turnOver]
  );

  // End the turn when the timer reaches zero.
  useEffect(
    function () {
      if (game && secondsLeft === 0 && !turnOver) {
        setTurnOver(true);
      }
    },
    [secondsLeft, game, turnOver]
  );

  function nextCard() {
    setCardIndex(function (previous) {
      if (deck.length === 0) {
        return 0;
      }

      return (previous + 1) % deck.length;
    });
  }

  function handleGotIt() {
    if (turnOver) return;

    const card = deck[cardIndex];

    if (!card) return;

    setTurnPoints(function (previous) {
      return previous + card.points;
    });

    nextCard();
  }

  function handleSkip() {
    if (turnOver) return;

    nextCard();
  }

  async function goToScoreboard() {
    if (!game) return;

    /*
     * Backend CurrentTeam is 1-based:
     * 1 = first team
     * 2 = second team
     * etc.
     *
     * Convert it to a 0-based index for the frontend arrays.
     */
    const currentTeamIndex = game.currentTeam - 1;

    const updatedScores = scores.slice();

    updatedScores[currentTeamIndex] =
      (updatedScores[currentTeamIndex] || 0) + turnPoints;

    // Persist scores for the current browser session.
    sessionStorage.setItem(
      "caps30_team_scores",
      JSON.stringify(updatedScores)
    );

    const isLastTeam =
      game.currentTeam === game.numberOfTeams;

    const nextTeam = isLastTeam
      ? 1
      : game.currentTeam + 1;

    const nextRound = isLastTeam
      ? game.currentRound + 1
      : game.currentRound;

    const finished = nextRound > game.numberOfRounds;

    try {
      // Update the game state in the backend.
      const updatedGame = await api.updateTeamGame(game.id, {
        grade: game.grade,
        subject: game.subject,
        topic: game.topic,
        numberOfTeams: game.numberOfTeams,
        numberOfRounds: game.numberOfRounds,
        currentTeam: nextTeam,
        currentRound: nextRound,
        isFinished: finished,
      });

      // Store useful information for the scoreboard/results pages.
      sessionStorage.setItem(
        "caps30_last_turn_points",
        String(turnPoints)
      );

      sessionStorage.setItem(
        "caps30_last_team_name",
        teamNames[currentTeamIndex] || `Team ${game.currentTeam}`
      );

      setScores(updatedScores);
      setGame(updatedGame);

      if (finished) {
        navigate("/team-mode/results");
      } else {
        navigate("/team-mode/scoreboard");
      }
    } catch (error) {
      console.error("Could not update team game:", error);
    }
  }

  if (!game || deck.length === 0 || teamNames.length === 0) {
    return (
      <div className="page">
        <p>Loading the game...</p>
      </div>
    );
  }

  const currentTeamIndex = game.currentTeam - 1;
  const currentTeamName =
    teamNames[currentTeamIndex] || `Team ${game.currentTeam}`;

  const currentTeamScore = scores[currentTeamIndex] || 0;

  if (turnOver) {
    return (
      <div className="page">
        <div className="card-surface team-turn-end">
          <p className="team-turn-end-time">Time!</p>

          <h1>{currentTeamName}</h1>

          <p className="team-turn-end-points">
            You scored <strong>{turnPoints}</strong>{" "}
            {turnPoints === 1 ? "point" : "points"} this turn.
          </p>

          <Button
            variant="accent"
            large
            onClick={goToScoreboard}
          >
            See scoreboard
          </Button>
        </div>
      </div>
    );
  }

  const timerClass =
    secondsLeft <= 10
      ? "team-game-timer team-game-timer--warning"
      : "team-game-timer";

  return (
    <div className="page">
      <div className="team-game-bar">
        <div>
          <p className="team-game-round">
            Round {game.currentRound} of {game.numberOfRounds}
          </p>

          <h1 className="team-game-turn">
            {currentTeamName}
          </h1>
        </div>

        <div className={timerClass} aria-live="polite">
          {secondsLeft}s
        </div>

        <span className="team-game-score">
          Turn: {turnPoints} · Total:{" "}
          {currentTeamScore + turnPoints}
        </span>
      </div>

      <TeamCard
        card={deck[cardIndex]}
        cardNumber={cardIndex + 1}
      />

      <div className="team-card-actions">
        <Button
          variant="success"
          onClick={handleGotIt}
        >
          ✓ Got it
        </Button>

        <Button
          variant="plain"
          onClick={handleSkip}
        >
          → Skip
        </Button>
      </div>
    </div>
  );
}