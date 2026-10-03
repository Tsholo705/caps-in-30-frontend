// Shows every team sorted from highest score to lowest.
export default function TeamScoreboard({ teams }) {
  const ranked = teams.slice().sort(function (a, b) {
    return b.score - a.score;
  });

  return (
    <div className="team-scoreboard">
      {ranked.map(function (team, index) {
        const rowClass =
          index === 0 ? "team-scoreboard-row is-leader" : "team-scoreboard-row";
        return (
          <div
            key={team.name + index}
            className={rowClass}
            style={{ animationDelay: index * 0.08 + "s" }}
          >
            <span className="team-scoreboard-rank">{index + 1}</span>
            <span className="team-scoreboard-name">{team.name}</span>
            <span className="team-scoreboard-score">{team.score}</span>
          </div>
        );
      })}
    </div>
  );
}
