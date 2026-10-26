import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Header from "./components/Header.jsx";

import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ScoreHistory from "./pages/ScoreHistory.jsx";
import SoloQuiz from "./pages/SoloQuiz.jsx";
import SoloResults from "./pages/SoloResults.jsx";
import TeamSetup from "./pages/TeamSetup.jsx";
import TeamGame from "./pages/TeamGame.jsx";
import TeamResults from "./pages/TeamResults.jsx";
import TeamScoreboard from "./pages/TeamScoreboardPage.jsx";
import SpellingPractice from "./pages/SpellingPractice.jsx";

function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/score-history" element={<ScoreHistory />} />
              <Route path="/solo-quiz" element={<SoloQuiz />} />
              <Route path="/spelling-practice" element={<SpellingPractice />} />
              <Route path="/solo-results" element={<SoloResults />} />
              <Route path="/team/setup" element={<TeamSetup />} />
              <Route path="/team/game" element={<TeamGame />} />
              <Route path="/team/results" element={<TeamResults />} />
              <Route
                path="/team/scoreboard"
                element={<TeamScoreboard />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}