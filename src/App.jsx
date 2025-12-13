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
import PuzzlesPage from "./pages/PuzzlesPage.jsx";
import PuzzleGamePage from "./pages/PuzzleGamePage.jsx";
import PuzzleAdminPage from "./pages/PuzzleAdminPage.jsx";
import SpectatorGamePage from "./pages/SpectatorGamePage.jsx";
import GameReviewPage from "./pages/GameReviewPage.jsx";
import DailyPuzzlesPage from "./pages/DailyPuzzlesPage.jsx";
import SeasonalEventsPage from "./pages/SeasonalEventsPage.jsx";
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
        <Route
          path="/puzzles"
          element={
            <ProtectedRoute>
              <PuzzlesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/puzzle/admin"
          element={
            <ProtectedRoute>
              <PuzzleAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/puzzle/:puzzleId"
          element={
            <ProtectedRoute>
              <PuzzleGamePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/spectator/:roomId"
          element={
            <ProtectedRoute>
              <SpectatorGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/review/:gameId"
          element={
            <ProtectedRoute>
              <GameReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/puzzles/daily"
          element={
            <ProtectedRoute>
              <DailyPuzzlesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/seasonal"
          element={
            <ProtectedRoute>
              <SeasonalEventsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
