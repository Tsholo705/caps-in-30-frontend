import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamScoreboard from "../components/TeamScoreboard.jsx";
import Button from "../components/Button.jsx";
import * as api from "../services/api.js";

export default function TeamScoreboardPage() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);

  useEffect(
    function () {
      const savedGame = api.getTeamGame();
      if (!savedGame) {
        navigate("/team-mode/setup");
        return;
      }
      if (savedGame.finished) {
        navigate("/team-mode/results");
        return;
      }
      setGame(savedGame);
    },
    [navigate]
  );

  function startNextTurn() {
    const updatedGame = {
      ...game,
      currentRound: game.nextRound,
      currentTeamIndex: game.nextTeamIndex,
    };
    api.saveTeamGame(updatedGame);
    navigate("/team-mode/game");
  }

  if (!game) {
    return (
      <div className="page">
        <p>Loading the scoreboard...</p>
      </div>
    );
  }

  const nextTeam = game.teams[game.nextTeamIndex];

  return (
    <div className="page">
      <h1 className="page-title text-centre">Scoreboard</h1>
      <p className="page-subtitle text-centre">
        {game.lastTeamName} scored {game.lastTurnPoints}{" "}
        {game.lastTurnPoints === 1 ? "point" : "points"} that turn.
      </p>

      <TeamScoreboard teams={game.teams} />

      <p className="team-next-up">
        Next up: <strong>{nextTeam.name}</strong>
      </p>
      <p className="text-centre page-subtitle">
        Round {game.nextRound} of {game.rounds}
      </p>

      <div className="row-actions">
        <Button variant="accent" large onClick={startNextTurn}>
          Next turn
        </Button>
      </div>
    </div>
  );
}
