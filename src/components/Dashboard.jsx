import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  Users,
  UserPlus,
  Trophy,
  User,
  Sword,
  MessageCircle,
  LogOut,
  Swords,
  GraduationCap,
  Shield,
  Bot,
  Share2,
} from "lucide-react"; // ✅ Added icons for Learn & Tournaments

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-2">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-sm p-4 text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          Welcome to <span className="text-indigo-600">Equatix.io</span>
        </h1>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[vh]">
          <DashboardButton
            label="Friends"
            icon={<Users size={16} />}
            onClick={() => navigate("/friends")}
            color="bg-green-500 hover:bg-green-600"
          />

          <DashboardButton
            label="Find Players"
            icon={<UserPlus size={16} />}
            onClick={() => navigate("/findPlayers")}
            color="bg-emerald-500 hover:bg-emerald-600"
          />

          <DashboardButton
            label="Leaderboard"
            icon={<Trophy size={16} />}
            onClick={() => navigate("/leaderboard")}
            color="bg-indigo-500 hover:bg-indigo-600"
          />

          <DashboardButton
            label="Challenges"
            icon={<Swords size={16} />}
            onClick={() => navigate("/challenges")}
            color="bg-orange-500 hover:bg-orange-600"
          />

          <DashboardButton
            label="Play with Bot"
            icon={<Bot size={16} />}
            onClick={() => navigate("/botgame")}
            color="bg-lime-500 hover:bg-lime-600"
          />

          <DashboardButton
            label="My Profile"
            icon={<User size={16} />}
            onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}
            color="bg-cyan-500 hover:bg-cyan-600"
          />

          <DashboardButton
            label="Search Opponent"
            icon={<Sword size={16} />}
            onClick={() => navigate("/match")}
            color="bg-yellow-500 hover:bg-yellow-600"
          />

          <DashboardButton
            label="Tournaments"
            icon={<Shield size={16} />}
            onClick={() => navigate("/tournaments")}
            color="bg-violet-500 hover:bg-violet-600"
          />

          <DashboardButton
            label="Learn"
            icon={<GraduationCap size={16} />}
            onClick={() => navigate("/learn")}
            color="bg-teal-500 hover:bg-teal-600"
          />

          <DashboardButton
            label="Feedback"
            icon={<MessageCircle size={16} />}
            onClick={() => navigate("/feedback")}
            color="bg-pink-500 hover:bg-pink-600"
          />

          <DashboardButton
            label="Logout"
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            color="bg-red-500 hover:bg-red-600"
          />

          <DashboardButton
            label="Socials"
            icon={<Share2 size={16} />}
            onClick={() => navigate("/socials")}
            color="bg-blue-400 hover:bg-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardButton = ({ label, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-2 h-8 text-sm text-white rounded-lg transition ${color}`}
  >
    <span>{label}</span>
    {icon}
  </button>
);

export default Dashboard;
