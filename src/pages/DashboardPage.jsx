import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../authContext";
import equatixLogo from "../assets/equatixLogo.png";
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
  ChevronRight,
  Gamepad2,
  Search,
  Activity,
} from "lucide-react"; // ✅ Added icons for Learn & Tournaments

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-2">
      <div className="w-full max-w-7xl h-[90vh] rounded-xl overflow-hidden shadow-2xl bg-slate-900/80 ring-1 ring-white/10">
        <div className="flex h-full">
          <aside className="hidden sm:flex sm:w-60 flex-col gap-2 p-3 bg-slate-900 text-slate-200 border-r border-white/10">
            <div className="px-2 py-3 text-lg font-semibold text-white">Equatix.io</div>
            <SidebarItem label="Play Now" icon={<Gamepad2 size={18} />} onClick={() => navigate("/match")} />
            <SidebarItem label="Challenges" icon={<Swords size={18} />} onClick={() => navigate("/challenges")} />
            <SidebarItem label="Play with Bot" icon={<Bot size={18} />} onClick={() => navigate("/botgame")} />
            <SidebarItem label="Leaderboard" icon={<Trophy size={18} />} onClick={() => navigate("/leaderboard")} />
            <SidebarItem label="Tournaments" icon={<Shield size={18} />} onClick={() => navigate("/tournaments")} />
            <SidebarItem label="Learn" icon={<GraduationCap size={18} />} onClick={() => navigate("/learn")} />
            <SidebarItem label="Friends" icon={<Users size={18} />} onClick={() => navigate("/friends")} />
            <SidebarItem label="Find Players" icon={<UserPlus size={18} />} onClick={() => navigate("/findPlayers")} />
            <SidebarItem label="Socials" icon={<Share2 size={18} />} onClick={() => navigate("/socials")} />

            <div className="mt-auto grid gap-2">
              <SidebarItem label="My Profile" icon={<User size={18} />} onClick={() => user && navigate(`/profile/${user.uid}`)} />
              <SidebarItem label="Feedback" icon={<MessageCircle size={18} />} onClick={() => navigate("/feedback")} />
              <SidebarItem label="Logout" icon={<LogOut size={18} />} onClick={handleLogout} />
            </div>
          </aside>

          <main className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-700/20 via-transparent to-transparent" />
            <div className="relative h-full p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full bg-slate-800 text-slate-100 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search players, friends, tournaments..." />
                </div>
              </div>

              {/* Hero Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 ring-1 ring-white/10">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Welcome to <span className="text-indigo-400">Equatix.io</span>
                      </h1>
                      <p className="text-xl text-slate-300 mb-6">
                        The ultimate math strategy game. Challenge friends, play against bots, and climb the leaderboards!
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <button 
                          onClick={() => navigate("/match")}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <Gamepad2 className="w-5 h-5" />
                          Play Now
                        </button>
                        <button 
                          onClick={() => navigate("/botgame")}
                          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <Bot className="w-5 h-5" />
                          Practice vs Bot
                        </button>
                      </div>
                    </div>
                    <div className="w-full lg:w-80 h-64 rounded-xl bg-gradient-to-br from-indigo-600/40 to-fuchsia-600/40 ring-1 ring-white/10 flex items-center justify-center p-6">
                      <img 
                        src={equatixLogo} 
                        alt="Equatix.io Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 text-center">
                      <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">1,250</p>
                      <p className="text-slate-400 text-sm">ELO Rating</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 text-center">
                      <Sword className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">47</p>
                      <p className="text-slate-400 text-sm">Games Won</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 text-center">
                      <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-slate-400 text-sm">Friends</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 text-center">
                      <Swords className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">3</p>
                      <p className="text-slate-400 text-sm">Active Challenges</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <Panel>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">Won against MathMaster123</p>
                          <p className="text-slate-400 text-xs">2 hours ago</p>
                        </div>
                        <span className="text-green-400 text-sm font-medium">+25 ELO</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">Completed "Equation Basics" lesson</p>
                          <p className="text-slate-400 text-xs">1 day ago</p>
                        </div>
                        <span className="text-blue-400 text-sm font-medium">+50 XP</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">New friend request from NumberNinja</p>
                          <p className="text-slate-400 text-xs">2 days ago</p>
                        </div>
                        <button className="text-yellow-400 text-sm font-medium hover:text-yellow-300">View</button>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* Right Column - Quick Actions & Info */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Panel>
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button 
                        onClick={() => navigate("/challenges")}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Swords className="w-5 h-5" />
                        View Challenges
                      </button>
                      <button 
                        onClick={() => navigate("/leaderboard")}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Trophy className="w-5 h-5" />
                        Leaderboard
                      </button>
                      <button 
                        onClick={() => navigate("/learn")}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <GraduationCap className="w-5 h-5" />
                        Learn & Practice
                      </button>
                      <button 
                        onClick={() => navigate("/tournaments")}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Shield className="w-5 h-5" />
                        Tournaments
                      </button>
                    </div>
                  </Panel>

                  {/* Tips & Tricks
                  <Panel>
                    <h2 className="text-xl font-semibold text-white mb-4">💡 Pro Tip</h2>
                    <p className="text-slate-300 text-sm mb-3">
                      Focus on controlling the center of the board early in the game. This gives you access to more multiplier squares and limits your opponent's options.
                    </p>
                    <button 
                      onClick={() => navigate("/learn")}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      Learn more strategies →
                    </button>
                  </Panel> */}

                  {/* Live Stats */}
                  <Panel>
                    <h2 className="text-xl font-semibold text-white mb-4">Live Stats</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Players Online</span>
                        <span className="text-white font-semibold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Games Today</span>
                        <span className="text-white font-semibold">2,847</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Your Rank</span>
                        <span className="text-white font-semibold">#342</span>
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Panel = ({ children }) => (
  <div className="rounded-xl bg-slate-800/40 p-5 ring-1 ring-white/10">
    {children}
  </div>
);

export default DashboardPage;
