// Shows the seconds left. It does NOT count down by itself:
// the page owns the countdown and passes the number in.
export default function Timer({ secondsLeft, warningAt = 10, large = false }) {
  const isWarning = secondsLeft <= warningAt;

  const classNames = ["game-timer"];
  if (isWarning) classNames.push("game-timer--warning");
  if (large) classNames.push("game-timer--large");

  return (
    <div className={classNames.join(" ")} aria-live="polite">
      {secondsLeft}s
    </div>
  );
}
