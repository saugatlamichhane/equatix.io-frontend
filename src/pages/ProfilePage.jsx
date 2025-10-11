// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api"; // CHANGE: Imported the centralized api instance
import { useAuth } from "../authContext";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  Sword, 
  Clock, 
  Star,
  Award,
  Activity,
  BarChart3,
  MessageCircle
} from "lucide-react";

const ProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentGames, setRecentGames] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    winRate: 0,
    avgGameTime: 0,
    longestWinStreak: 0,
    totalPlayTime: 0
  });
  const [hasChallenge, setHasChallenge] = useState(false);

  useEffect(() => {
    // CHANGE: Refactored fetchProfile to use the new API structure
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/Profile/${uid}`);
        setProfile(res.data);
        
        // Calculate additional stats from live data
        const totalGames = res.data.wins + res.data.losses + res.data.draws;
        const winRate = totalGames > 0 ? (res.data.wins / totalGames * 100).toFixed(1) : 0;
        
        setStats({
          winRate: parseFloat(winRate),
          avgGameTime: 8.5, // Mock data - as requested
          longestWinStreak: 12, // Mock data - as requested
          totalPlayTime: totalGames * 8.5 // Mock calculation based on live data
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // CHANGE: Removed mock profile creation on API failure
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    // This data remains mocked as requested
    const fetchRecentGames = async () => {
      try {
        setRecentGames([
          { id: 1, opponent: "MathMaster123", result: "win", duration: "7:32", date: "2 hours ago" },
          { id: 2, opponent: "NumberNinja", result: "loss", duration: "12:15", date: "1 day ago" },
          { id: 3, opponent: "EquationExpert", result: "win", duration: "9:43", date: "2 days ago" },
          { id: 4, opponent: "Bot", result: "win", duration: "5:21", date: "3 days ago" },
        ]);
      } catch (error) {
        console.error("Failed to fetch recent games:", error);
      }
    };

    // This data remains mocked as requested
    const fetchAchievements = async () => {
      try {
        setAchievements([
          { id: 1, name: "First Win", description: "Win your first game", icon: "🏆", unlocked: true },
          { id: 2, name: "Win Streak", description: "Win 5 games in a row", icon: "🔥", unlocked: true },
          { id: 3, name: "Math Master", description: "Reach 1500 ELO", icon: "🧠", unlocked: false },
          { id: 4, name: "Social Player", description: "Add 10 friends", icon: "👥", unlocked: true },
        ]);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      }
    };

    const checkFriend = async () => {
      if (!user || !uid || user.uid === uid) return;
      try {
        // CHANGE: Uses the api instance now
        const res = await api.get(`/Friends`);
        const friendUids = res.data.players.map((f) => f.uid);
        setIsFriend(friendUids.includes(uid));
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setIsFriend(false);
      }
    };

    const fetchChallenges = async () => {
      if (!user || !uid || user.uid === uid) {
        setHasChallenge(false);
        return;
      }
      try {
        // CHANGE: Uses the api instance now
        const res1 = await api.get(`/challenge/sent`);
        const res2 = await api.get("/challenge/received");
        const all = [...res1.data.challenges, ...res2.data.challenges];
        const exists = all.some((challenge) => {
          const participants = [challenge.challenger_id, challenge.opponent_id];
          const relevantStatus = ["pending", "accepted", "in_progress"];
          return (
            participants.includes(uid) &&
            participants.includes(user.uid) &&
            relevantStatus.includes(challenge.status)
          );
        });
        setHasChallenge(exists);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        setHasChallenge(false);
      }
    };

    fetchProfile();
    fetchRecentGames();
    fetchAchievements();
    checkFriend();
    fetchChallenges();
  }, [uid, user]);

  const handleFriendToggle = async () => {
    if (!user) return;
    try {
      if (isFriend) {
        // CHANGE: Uses the api instance now
        await api.delete("/friends", {
          data: { myUid: user.uid, friendUid: uid },
        });
        setIsFriend(false);
      } else {
        // CHANGE: Uses the api instance now
        await api.post("/friends", {
          myUid: user.uid,
          friendUid: uid,
        });
        setIsFriend(true);
      }
    } catch (error) {
      console.error("Failed to update friends:", error);
    }
  };

  const handleChallenge = async () => {
    if (!user) return;
    if (user.uid === uid) {
      alert("You can't challenge yourself!");
      return;
    }
    if (hasChallenge) {
      alert("You already have a pending or ongoing challenge with this user.");
      return;
    }
    try {
      // CHANGE: Uses the api instance now
      const createRes = await api.post(`/challenge/send/${uid}`);
      if (createRes.data.success) {
        alert("🎯 Challenge sent!");
        setHasChallenge(true);
      } else {
        alert("⚠️ Failed to send challenge.");
      }
    } catch (err) {
      console.error("Challenge error:", err);
      alert("❌ Error sending challenge.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-300">Loading profile...</div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">User not found</div>
      </div>
    );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 ring-1 ring-white/10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={profile.photo}
                alt="Profile"
                className="w-32 h-32 rounded-full ring-4 ring-white/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{profile.name}</h1>
              <p className="text-slate-300 mb-4">UID: {profile.uid}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-2xl font-bold text-indigo-400">{profile.elo}</span>
                  <span className="text-slate-300">ELO Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Rank #{Math.floor(Math.random() * 1000) + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Joined 2 months ago</span>
                </div>
              </div>

              {user && user.uid !== uid && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleFriendToggle}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                      isFriend ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    {isFriend ? "Unfriend" : "Add Friend"}
                  </button>

                  <button
                    onClick={handleChallenge}
                    disabled={hasChallenge}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                      hasChallenge ? "bg-slate-600 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"
                    }`}
                  >
                    <Sword className="w-5 h-5" />
                    {hasChallenge ? "Challenge Pending" : "Challenge"}
                  </button>

                  <button className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Games */}
          <div className="lg:col-span-2 space-y-8">
            {/* Game Statistics */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Game Statistics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{profile.wins}</p>
                  <p className="text-slate-400 text-sm">Wins</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{profile.losses}</p>
                  <p className="text-slate-400 text-sm">Losses</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{profile.draws}</p>
                  <p className="text-slate-400 text-sm">Draws</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
                  <p className="text-slate-400 text-sm">Win Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span className="text-slate-300 font-medium">Avg Game Time</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.avgGameTime} min</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-slate-300 font-medium">Best Streak</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.longestWinStreak} wins</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span className="text-slate-300 font-medium">Total Play Time</span>
                  </div>
                  <p className="text-xl font-bold text-white">{Math.round(stats.totalPlayTime / 60)}h</p>
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Recent Games
              </h2>
              
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div key={game.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          game.result === 'win' ? 'bg-green-400' : 
                          game.result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">vs {game.opponent}</p>
                          <p className="text-slate-400 text-sm">{game.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          game.result === 'win' ? 'text-green-400' : 
                          game.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {game.result.toUpperCase()}
                        </p>
                        <p className="text-slate-400 text-sm">{game.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Achievements & Info */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements
              </h2>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg ${
                    achievement.unlocked ? 'bg-slate-700/50' : 'bg-slate-800/30 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${
                          achievement.unlocked ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-green-400">
                          <Star className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Games Played</span>
                  <span className="text-white font-semibold">
                    {profile.wins + profile.losses + profile.draws}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Streak</span>
                  <span className="text-white font-semibold">3 wins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Favorite Mode</span>
                  <span className="text-white font-semibold">Ranked</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Best ELO</span>
                  <span className="text-white font-semibold">1,450</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;