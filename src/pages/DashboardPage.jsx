import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../authContext";
import equatixLogo from "../assets/equatixLogo.png";
import api from "../utils/api";
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
  Bot,
  Share2,
  Gamepad2,
  Search,
  Puzzle,
  Menu,
  X,
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [quickStats, setQuickStats] = React.useState({
    elo: 0,
    gamesWon: 0,
    friends: 0,
    activeChallenges: 0,
  });

  const [liveStats, setLiveStats] = React.useState({
    players_online: 0,
    games_today: 0,
    your_rating: 0,
    your_rank: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [quickStatsResponse, liveStatsResponse] = await Promise.all([
          api.get("/quickstats"),
          api.get("/livestats")
        ]);
        setQuickStats(quickStatsResponse.data);
        setLiveStats(liveStatsResponse.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(() => {
      api.get("/livestats")
        .then(response => setLiveStats(response.data))
        .catch(error => console.error("Error refreshing live stats:", error));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-slate-200 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="text-lg font-semibold text-white">Equatix.io</div>
              <button onClick={closeMobileMenu} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <SidebarItem label="Play Now" icon={<Gamepad2 size={18} />} onClick={() => { navigate("/match"); closeMobileMenu(); }} />
              <SidebarItem label="Challenges" icon={<Swords size={18} />} onClick={() => { navigate("/challenges"); closeMobileMenu(); }} />
              <SidebarItem label="Play with Bot" icon={<Bot size={18} />} onClick={() => { navigate("/botgame"); closeMobileMenu(); }} />
              <SidebarItem label="Puzzles" icon={<Puzzle size={18} />} onClick={() => { navigate("/puzzles"); closeMobileMenu(); }} />
              <SidebarItem label="Leaderboard" icon={<Trophy size={18} />} onClick={() => { navigate("/leaderboard"); closeMobileMenu(); }} />
              <SidebarItem label="Learn" icon={<GraduationCap size={18} />} onClick={() => { navigate("/learn"); closeMobileMenu(); }} />
              <SidebarItem label="Friends" icon={<Users size={18} />} onClick={() => { navigate("/friends"); closeMobileMenu(); }} />
              <SidebarItem label="Find Players" icon={<UserPlus size={18} />} onClick={() => { navigate("/findPlayers"); closeMobileMenu(); }} />
              <SidebarItem label="Socials" icon={<Share2 size={18} />} onClick={() => { navigate("/socials"); closeMobileMenu(); }} />

              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <SidebarItem label="My Profile" icon={<User size={18} />} onClick={() => { user && navigate(`/profile/${user.uid}`); closeMobileMenu(); }} />
                <SidebarItem label="Feedback" icon={<MessageCircle size={18} />} onClick={() => { navigate("/feedback"); closeMobileMenu(); }} />
                <SidebarItem label="Logout" icon={<LogOut size={18} />} onClick={() => { handleLogout(); closeMobileMenu(); }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-60 flex-col gap-2 p-3 bg-slate-900 text-slate-200 border-r border-white/10">
          <div className="px-2 py-3 text-lg font-semibold text-white">Equatix.io</div>
          <SidebarItem label="Play Now" icon={<Gamepad2 size={18} />} onClick={() => navigate("/match")} />
          <SidebarItem label="Challenges" icon={<Swords size={18} />} onClick={() => navigate("/challenges")} />
          <SidebarItem label="Play with Bot" icon={<Bot size={18} />} onClick={() => navigate("/botgame")} />
          <SidebarItem label="Puzzles" icon={<Puzzle size={18} />} onClick={() => navigate("/puzzles")} />
          <SidebarItem label="Leaderboard" icon={<Trophy size={18} />} onClick={() => navigate("/leaderboard")} />
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

        {/* Main Content Area */}
        <main className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-700/20 via-transparent to-transparent" />
          <div className="relative h-full overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-slate-300 hover:text-white p-2"
                >
                  <Menu size={20} />
                </button>
                <div className="text-lg font-semibold text-white">Equatix.io</div>
              </div>
              <div className="text-sm text-slate-400">
                Hi, {user?.displayName?.split(' ')[0] || 'Player'}
              </div>
            </div>

            <div className="p-4 lg:p-6">
              {/* Search Bar */}
              <div className="mb-4 lg:mb-6">
                <div className="relative max-w-md mx-auto lg:mx-0">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full bg-slate-800 text-slate-100 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search players, friends..." />
                </div>
              </div>

              {/* Hero Section */}
              <div className="mb-6 lg:mb-8">
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl lg:rounded-2xl p-4 lg:p-8 ring-1 ring-white/10">
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 lg:mb-4">
                        Welcome to <span className="text-indigo-400">Equatix.io</span>
                      </h1>
                      <p className="text-base lg:text-xl text-slate-300 mb-4 lg:mb-6">
                        The ultimate math strategy game. Challenge friends and climb the leaderboards!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
                        <button onClick={() => navigate("/match")} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                          <Gamepad2 className="w-4 h-4 lg:w-5 lg:h-5" /> Play Now
                        </button>
                        <button onClick={() => navigate("/botgame")} className="bg-slate-600 hover:bg-slate-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                          <Bot className="w-4 h-4 lg:w-5 lg:h-5" /> Practice vs Bot
                        </button>
                      </div>
                    </div>
                    <div className="w-full max-w-xs lg:w-80 h-48 lg:h-64 rounded-xl bg-gradient-to-br from-indigo-600/40 to-fuchsia-600/40 ring-1 ring-white/10 flex items-center justify-center p-4 lg:p-6">
                      <img src={equatixLogo} alt="Equatix.io Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <StatCard icon={<Trophy className="text-yellow-400" />} value={Math.round(quickStats.elo)} label="ELO Rating" />
                    <StatCard icon={<Sword className="text-green-400" />} value={quickStats.gamesWon} label="Games Won" />
                    <StatCard icon={<Users className="text-blue-400" />} value={quickStats.friends} label="Friends" />
                    <StatCard icon={<Swords className="text-purple-400" />} value={quickStats.activeChallenges} label="Challenges" />
                  </div>
                </div>

                <div className="xl:col-span-1">
                  <Panel>
                    <h2 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">Live Stats</h2>
                    <div className="space-y-3">
                      <LiveStatRow label="Players Online" value={liveStats.players_online.toLocaleString()} />
                      <LiveStatRow label="Games Today" value={liveStats.games_today.toLocaleString()} />
                      <LiveStatRow label="Your Rank" value={`#${liveStats.your_rank}`} />
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/* Sub-components for cleaner structure */
const SidebarItem = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const StatCard = ({ icon, value, label }) => (
  <div className="bg-slate-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 ring-1 ring-white/10 text-center">
    <div className="flex justify-center mb-1 lg:mb-2">{React.cloneElement(icon, { size: 24 })}</div>
    <p className="text-lg lg:text-2xl font-bold text-white">{value}</p>
    <p className="text-slate-400 text-xs lg:text-sm">{label}</p>
  </div>
);

const LiveStatRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-300 text-sm">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const Panel = ({ children }) => (
  <div className="rounded-xl bg-slate-800/40 p-5 ring-1 ring-white/10">
    {children}
  </div>
);

export default DashboardPage;