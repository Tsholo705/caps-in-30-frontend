
import { Link } from "react-router-dom";
import logoAsset from "../assets/caps-in-30-logo.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <img
              src={logoAsset}
              alt="Caps in 30 Seconds"
              className="site-footer-logo-image"
            />
          </Link>

          <p>
            Learn, revise and challenge yourself — one round at a time!
          </p>
        </div>

        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/team-mode/setup">Team Mode</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/score-history">Score History</Link>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Caps In 30 Seconds.
          {" "}Made for curious minds.
        </p>
      </div>
    </footer>
  );
}
