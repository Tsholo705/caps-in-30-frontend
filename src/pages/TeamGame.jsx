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
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [turnPoints, setTurnPoints] = useState(0);
  const [turnOver, setTurnOver] = useState(false);

  // 1. Load the saved game and build a shuffled deck for this turn.
  useEffect(
    function () {
      const savedGame = api.getTeamGame();
      if (!savedGame) {
        navigate("/team-mode/setup");
        return;
      }
      setGame(savedGame);
      setSecondsLeft(savedGame.secondsPerTurn);
      setDeck(api.getTeamCards(savedGame.grade, savedGame.subject, savedGame.topic));
    },
    [navigate]
  );

  // 2. One shared countdown that keeps running across cards.
  useEffect(
    function () {
      if (!game || turnOver) return undefined;

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
    [game, turnOver]
  );

  // 3. When the clock hits zero the turn ends.
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
      return (previous + 1) % Math.max(deck.length, 1);
    });
  }

  function handleGotIt() {
    if (turnOver) return;
    const card = deck[cardIndex];
    setTurnPoints(function (previous) {
      return previous + card.points;
    });
    nextCard();
  }

  function handleSkip() {
    if (turnOver) return;
    nextCard();
  }

  // Save the turn result and move on to the scoreboard.
  function goToScoreboard() {
    const updatedTeams = game.teams.map(function (team, index) {
      if (index !== game.currentTeamIndex) return team;
      return { name: team.name, score: team.score + turnPoints };
    });

    const isLastTeam = game.currentTeamIndex === game.teams.length - 1;
    const nextTeamIndex = isLastTeam ? 0 : game.currentTeamIndex + 1;
    const nextRound = isLastTeam ? game.currentRound + 1 : game.currentRound;
    const finished = nextRound > game.rounds;

    const updatedGame = {
      ...game,
      teams: updatedTeams,
      lastTurnPoints: turnPoints,
      lastTeamName: game.teams[game.currentTeamIndex].name,
      nextTeamIndex: nextTeamIndex,
      nextRound: nextRound,
      finished: finished,
    };

    api.saveTeamGame(updatedGame);

    if (finished) {
      navigate("/team-mode/results");
    } else {
      navigate("/team-mode/scoreboard");
    }
  }

  if (!game || deck.length === 0) {
    return (
      <div className="page">
        <p>Shuffling the cards...</p>
      </div>
    );
  }

  const currentTeam = game.teams[game.currentTeamIndex];

  if (turnOver) {
    return (
      <div className="page">
        <div className="card-surface team-turn-end">
          <p className="team-turn-end-time">Time!</p>
          <h1>{currentTeam.name}</h1>
          <p className="team-turn-end-points">
            You scored <strong>{turnPoints}</strong>{" "}
            {turnPoints === 1 ? "point" : "points"} this turn.
          </p>
          <Button variant="accent" large onClick={goToScoreboard}>
            See scoreboard
          </Button>
        </div>
      </div>
    );
  }

  const timerClass =
    secondsLeft <= 10 ? "team-game-timer team-game-timer--warning" : "team-game-timer";

  return (
    <div className="page">
      <div className="team-game-bar">
        <div>
          <p className="team-game-round">
            Round {game.currentRound} of {game.rounds}
          </p>
          <h1 className="team-game-turn">{currentTeam.name}</h1>
        </div>
        <div className={timerClass} aria-live="polite">
          {secondsLeft}s
        </div>
        <span className="team-game-score">
          Turn: {turnPoints} · Total: {currentTeam.score + turnPoints}
        </span>
      </div>

      <TeamCard card={deck[cardIndex]} cardNumber={cardIndex + 1} />

      <div className="team-card-actions">
        <Button variant="success" onClick={handleGotIt}>
          ✓ Got it
        </Button>
        <Button variant="plain" onClick={handleSkip}>
          → Skip
        </Button>
      </div>
    </div>
  );
}
