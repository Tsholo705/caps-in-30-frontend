const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuizQuestion({ question, onAnswer }) {
  return (
    <div className="card-surface quiz-question-card">
      <span className="badge">
        {question.subject} · {question.topic}
      </span>
      <h2 className="quiz-question-text">{question.text}</h2>

      <div className="quiz-option-list">
        {question.options.map(function (option, index) {
          return (
            <button
              key={index}
              className="quiz-option"
              onClick={function () {
                onAnswer(index);
              }}
            >
              <span className="quiz-option-letter">{LETTERS[index]}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
