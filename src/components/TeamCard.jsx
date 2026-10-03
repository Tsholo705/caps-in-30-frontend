export default function TeamCard({ card, cardNumber }) {
  return (
    <div className="team-card">
      <span className="team-card-points">+{card.points} point</span>
      <h2 className="team-card-term">{card.term}</h2>

      <span className="team-card-forbidden-label">DO NOT SAY:</span>
      <ul className="team-card-forbidden-list">
        {card.forbiddenWords.map(function (word) {
          return <li key={word}>{word}</li>;
        })}
      </ul>

      <p className="team-card-meta">
        Card {cardNumber} · {card.subject} · Grade {card.grade}
      </p>
    </div>
  );
}
