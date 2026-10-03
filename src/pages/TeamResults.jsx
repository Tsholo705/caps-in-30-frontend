import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import TeamScoreboard from "../components/TeamScoreboard.jsx";
import * as api from "../services/api.js";

const MEDALS = ["🏆", "🥈", "🥉"];

export default function TeamResults() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);

  useEffect(
    function () {
      const savedGame = api.getTeamGame();
      if (!savedGame) {
        navigate("/team-mode/setup");
        return;
      }
      setGame(savedGame);
    },
    [navigate]
  );

  function playAgain() {
    api.clearTeamGame();
    navigate("/team-mode/setup");
  }

  if (!game) {
    return (
      <div className="page">
        <p>Counting the final scores...</p>
      </div>
    );
  }

  const ranked = game.teams.slice().sort(function (a, b) {
    return b.score - a.score;
  });
  const winner = ranked[0];
  const podium = ranked.slice(0, 3);

  return (
    <div className="page">
      <div className="team-winner-banner">🎉 {winner.name} wins with {winner.score} points! 🎉</div>

      <div className="team-podium">
        {podium.map(function (team, index) {
          return (
            <div
              key={team.name + index}
              className={"team-podium-step team-podium-step--" + (index + 1)}
              style={{ animationDelay: index * 0.12 + "s" }}
            >
              <div className="team-podium-medal">{MEDALS[index]}</div>
              <div className="team-podium-name">{team.name}</div>
              <div className="team-podium-score">{team.score}</div>
            </div>
          );
        })}
      </div>

      <h2 className="text-centre">Final standings</h2>
      <TeamScoreboard teams={game.teams} />

      <div className="row-actions" style={{ marginTop: "2rem" }}>
        <Button variant="accent" onClick={playAgain}>
          Play again
        </Button>
        <Button
          variant="ghost"
          onClick={function () {
            api.clearTeamGame();
            navigate("/");
          }}
        >
          Back home
        </Button>
      </div>
    </div>
  );
}
