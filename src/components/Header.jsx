import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logoAsset from "../assets/caps-in-30-logo.png";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          <img src={logoAsset} alt="Caps in 30 Seconds" className="site-logo-image" />
        </Link>

        <nav className="site-nav">
          <Link to="/" className="site-nav-link" activeProps={{ className: "site-nav-link is-active" }}>
            Home
          </Link>
          <Link
            to="/team-mode/setup"
            className="site-nav-link"
            activeProps={{ className: "site-nav-link is-active" }}
          >
            Team Mode
          </Link>

          {user ? (
            <>
              <Link
                to="/timetables"
                className="site-nav-link"
                activeProps={{ className: "site-nav-link is-active" }}
              >
                Timetables
              </Link>
              <Link
                to="/dashboard"
                className="site-nav-link"
                activeProps={{ className: "site-nav-link is-active" }}
              >
                Dashboard
              </Link>
              <Link
                to="/score-history"
                className="site-nav-link"
                activeProps={{ className: "site-nav-link is-active" }}
              >
                Scores
              </Link>
              <span className="site-nav-user">Hi, {user.name}</span>
              <button className="app-button app-button--accent" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="site-nav-link"
                activeProps={{ className: "site-nav-link is-active" }}
              >
                Log in
              </Link>
              <Link to="/register" className="app-button app-button--success">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
