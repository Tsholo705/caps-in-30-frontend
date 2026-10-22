import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/passwordToggle.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in your username and password.");
      return;
    }

    setBusy(true);
    login(username.trim(), password)
      .then(function () {
        navigate("/dashboard");
      })
      .catch(function (err) {
        setError(err.message);
        setBusy(false);
      });
  }

  return (
    <div className="page auth-page">
      <h1 className="page-title">Welcome back</h1>
      <p className="page-subtitle">Log in to play Solo Mode and see your scores.</p>

      <form className="card-surface" onSubmit={handleSubmit}>
        {error ? <p className="form-banner-error">{error}</p> : null}

        <div className="form-field">
          <label className="form-label" htmlFor="login-username">
            Username
          </label>
          <input
            id="login-username"
            className="form-input"
            value={username}
            onChange={function (e) {
              setUsername(e.target.value);
            }}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            value={password}
            onChange={function (e) {
              setPassword(e.target.value);
            }}
          />
          <div className="password-toggle">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={function (e) {
                setShowPassword(e.target.checked);
              }}
            />
            <label htmlFor="show-password">Show password</label>
          </div>
        </div>

        <Button type="submit" variant="primary" block disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </Button>

        <p className="form-switch-text">
          No account yet? <Link to="/register">Create one here</Link>
        </p>
      </form>
    </div>
  );
}
