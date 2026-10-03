// A single button component so every button looks the same.
// variant: "primary" | "accent" | "success" | "ghost" | "plain"
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  large = false,
  block = false,
  disabled = false,
}) {
  const classNames = ["app-button"];
  if (variant !== "plain") classNames.push("app-button--" + variant);
  if (large) classNames.push("app-button--large");
  if (block) classNames.push("app-button--block");

  return (
    <button
      type={type}
      className={classNames.join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
