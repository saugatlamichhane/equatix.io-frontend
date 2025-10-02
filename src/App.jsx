import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FindPlayersPage from "./pages/FindPlayersPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import GameHomePage from "./pages/GameHomePage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import LearnPage from "./pages/LearnPage.jsx";
import TournamentsPage from "./pages/TournamentsPage.jsx";
import ChallengeGamePage from "./pages/ChallengeGamePage.jsx";
import ChallengesPage from "./pages/ChallengesPage.jsx";
import SocialsPage from "./pages/SocialsPage.jsx";
import BotGamePage from "./pages/BotGamePage.jsx";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/challenge/:challengeId"
          element={
            <ProtectedRoute>
              <ChallengeGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/botgame"
          element={
            <ProtectedRoute>
              <BotGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <ChallengesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/socials"
          element={
            <ProtectedRoute>
              <SocialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <TournamentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/findPlayers"
          element={
            <ProtectedRoute>
              <FindPlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:uid"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match"
          element={
            <ProtectedRoute>
              <GameHomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
