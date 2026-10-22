import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // 1. Import your auth hook

export default function Home() {
  const { user } = useAuth(); // 2. Grab the logged-in user state

  return (
    <div className="page">
      <section className="home-hero">
        <p className="home-hero-kicker">CAPS In 30 Seconds · Can you beat the clock?</p>
        <h1 className="home-hero-title">
          Think Fast. <span>Learn Smart</span>
        </h1>
        
      </section>

      <section className="home-mode-grid">
        <article className="home-mode-card home-mode-card--solo">
          <span className="home-mode-emoji">🎯</span>
          <h2 className="home-mode-title">Solo Mode</h2>
          <p className="home-mode-tagline">Test Yourself</p>
          <ul className="home-mode-list">
            <li>Pick your subject, topic and timer</li>
            <li>Answer 5 to 20 questions against the clock</li>
            <li>Track every score in your history</li>
          </ul>
          
          {/* 3. Send logged-in users to the dashboard to select options, otherwise to login */}
          <Link 
            to={user ? "/dashboard" : "/login"} 
            className="app-button app-button--large"
          >
            Test Yourself
          </Link>
        </article>

        <article className="home-mode-card home-mode-card--team">
          <span className="home-mode-emoji">🔥</span>
          <h2 className="home-mode-title">Team Mode</h2>
          <p className="home-mode-tagline">Challenge Your Team</p>
          <ul className="home-mode-list">
            <li>2 to 4 teams on one shared device</li>
            <li>Describe the term without the banned words</li>
            <li>30 seconds per turn — go, go, go!</li>
          </ul>
          <Link to="/team-mode/setup" className="app-button app-button--large">
            Challenge Your Team
          </Link>
        </article>
      </section>

      <section className="home-strip">
        <div className="home-strip-item">
          <strong>4</strong>
          Subjects covered
        </div>
        <div className="home-strip-item">
          <strong>30s</strong>
          Every turn counts
        </div>
        <div className="home-strip-item">
          <strong>2</strong>
          Ways to play
        </div>
      </section>
    </div>
  );
}
