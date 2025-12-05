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
  MessageCircle,
  ArrowLeft,
  Eye,
  BookOpen,
  CheckCircle
} from "lucide-react";

const ProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [friendStatus, setFriendStatus] = useState("none"); // 'none', 'friend', 'request_sent', 'request_received'
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
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [activeGameRoom, setActiveGameRoom] = useState(null); // For spectator mode
  const [dailyMissions, setDailyMissions] = useState([]);

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
          longestWinStreak: res.data.bestWinStreak || 0, // Mock data - as requested
          totalPlayTime: totalGames * 8.5, // Mock calculation based on live data
          currentStreak: res.data.currentStreak || 0, // Mock data - as requested
          bestElo: res.data.bestElo || Math.round(res.data.elo) || 0, // Mock data - as requested
          gamesPlayed: totalGames
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
    // TODO: Replace with real API call when backend endpoint is ready
    const fetchRecentGames = async () => {
      try {
        // Mock game data with gameId for review functionality
        setRecentGames([
          { 
            id: 1, 
            gameId: "game-001",
            opponent: "MathMaster123", 
            opponentUid: "uid-123",
            result: "win", 
            duration: "7:32", 
            date: "2 hours ago",
            score: { player: 150, opponent: 120 },
            variant: "normal"
          },
          { 
            id: 2, 
            gameId: "game-002",
            opponent: "NumberNinja", 
            opponentUid: "uid-456",
            result: "loss", 
            duration: "12:15", 
            date: "1 day ago",
            score: { player: 95, opponent: 180 },
            variant: "blitz"
          },
          { 
            id: 3, 
            gameId: "game-003",
            opponent: "EquationExpert", 
            opponentUid: "uid-789",
            result: "win", 
            duration: "9:43", 
            date: "2 days ago",
            score: { player: 200, opponent: 145 },
            variant: "normal"
          },
          { 
            id: 4, 
            gameId: "game-004",
            opponent: "Bot", 
            opponentUid: "bot-001",
            result: "win", 
            duration: "5:21", 
            date: "3 days ago",
            score: { player: 175, opponent: 100 },
            variant: "marathon"
          },
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

    const checkFriendStatus = async () => {
      if (!user || !uid || user.uid === uid) {
        setFriendStatus("none");
        return;
      }
      try {
        // Check all friend-related data in parallel
        const [friendsRes, incomingRes, sentRes] = await Promise.all([
          api.get("/friends").catch(() => ({ data: { friends: [] } })),
          api.get("/friend-requests").catch(() => ({ data: { requests: [] } })),
          api.get("/friend-requests/sent").catch(() => ({ data: { sentRequests: [] } }))
        ]);

        const friends = friendsRes.data.friends || [];
        const incomingRequests = incomingRes.data.requests || [];
        const sentRequests = sentRes.data.sentRequests || [];

        // Determine friend status
        if (friends.some(f => f.uid === uid)) {
          setFriendStatus("friend");
        } else if (sentRequests.some(r => r.uid === uid)) {
          setFriendStatus("request_sent");
        } else if (incomingRequests.some(r => r.uid === uid)) {
          setFriendStatus("request_received");
        } else {
          setFriendStatus("none");
        }
      } catch (error) {
        console.error("Failed to check friend status:", error);
        setFriendStatus("none");
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

    const checkActiveGame = async () => {
      if (!uid || user?.uid === uid) {
        setActiveGameRoom(null);
        return;
      }
      try {
        // Check if this user has an active challenge/game
        const res1 = await api.get(`/challenge/sent`).catch(() => ({ data: { challenges: [] } }));
        const res2 = await api.get("/challenge/received").catch(() => ({ data: { challenges: [] } }));
        const allChallenges = [...res1.data.challenges, ...res2.data.challenges];
        
        // Find active game where this user is participating
        const activeGame = allChallenges.find((challenge) => {
          const participants = [challenge.challenger_id, challenge.opponent_id];
          const activeStatus = ["accepted", "in_progress"];
          return (
            participants.includes(uid) &&
            activeStatus.includes(challenge.status)
          );
        });

        if (activeGame) {
          // Use challenge ID as room identifier
          setActiveGameRoom(`challenge${activeGame.id}`);
        } else {
          setActiveGameRoom(null);
        }
      } catch (error) {
        console.error("Failed to check active game:", error);
        setActiveGameRoom(null);
      }
    };

    const fetchDailyMissions = async () => {
      // TODO: Replace with real API call when backend endpoint is ready
      // Mock daily missions data
      try {
        setDailyMissions([
          {
            id: "mission-1",
            title: "Win 3 Games",
            description: "Win 3 games today",
            progress: 2,
            target: 3,
            reward: { coins: 100, xp: 50 },
            completed: false,
            claimed: false,
            icon: "🏆"
          },
          {
            id: "mission-2",
            title: "Play 5 Games",
            description: "Play 5 games today",
            progress: 3,
            target: 5,
            reward: { coins: 50, xp: 25 },
            completed: false,
            claimed: false,
            icon: "🎮"
          },
          {
            id: "mission-3",
            title: "Solve a Puzzle",
            description: "Complete any puzzle",
            progress: 1,
            target: 1,
            reward: { coins: 75, xp: 30 },
            completed: true,
            claimed: false,
            icon: "🧩"
          },
          {
            id: "mission-4",
            title: "Challenge a Friend",
            description: "Send a challenge to a friend",
            progress: 0,
            target: 1,
            reward: { coins: 25, xp: 15 },
            completed: false,
            claimed: false,
            icon: "⚔️"
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch daily missions:", error);
      }
    };

    fetchProfile();
    fetchRecentGames();
    fetchAchievements();
    checkFriendStatus();
    fetchChallenges();
    checkActiveGame();
    fetchDailyMissions();
  }, [uid, user]);

  const handleFriendAction = async () => {
    if (!user || friendActionLoading) return;
    
    setFriendActionLoading(true);
    try {
      if (friendStatus === "friend") {
        // Unfriend: Delete friend relationship
        const res = await api.delete(`/friend/${uid}`);
        if (res.data.success) {
          setFriendStatus("none");
          alert("Friend removed");
        } else {
          alert(res.data.error || "Failed to remove friend");
        }
      } else if (friendStatus === "request_sent") {
        // Cancel sent request
        const res = await api.delete(`/friend-request/cancel/${uid}`);
        if (res.data.success) {
          setFriendStatus("none");
          alert("Friend request canceled");
        } else {
          alert(res.data.error || "Failed to cancel request");
        }
      } else if (friendStatus === "request_received") {
        // Accept incoming request
        const res = await api.post(`/friend-request/accept/${uid}`);
        if (res.data.success) {
          setFriendStatus("friend");
          alert("Friend request accepted!");
        } else {
          alert(res.data.error || "Failed to accept request");
        }
      } else {
        // Send friend request
        const res = await api.post(`/friend-request/${uid}`);
        if (res.data.success) {
          setFriendStatus("request_sent");
          alert("Friend request sent!");
        } else {
          alert(res.data.error || "Failed to send friend request");
        }
      }
      // Refresh friend status after action
      await checkFriendStatus();
    } catch (error) {
      console.error("Failed to update friends:", error);
      alert(error.response?.data?.error || "An error occurred");
    } finally {
      setFriendActionLoading(false);
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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

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
                  <span className="text-2xl font-bold text-indigo-400">{Math.round(profile.elo)}</span>
                  <span className="text-slate-300">ELO Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Rank #{profile.rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Joined {profile.joined_ago}</span>
                </div>
              </div>

              {user && user.uid !== uid && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleFriendAction}
                    disabled={friendActionLoading}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                      friendStatus === "friend" 
                        ? "bg-red-500 hover:bg-red-600" 
                        : friendStatus === "request_sent"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : friendStatus === "request_received"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    } ${friendActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Users className="w-5 h-5" />
                    {friendActionLoading 
                      ? "Loading..." 
                      : friendStatus === "friend" 
                        ? "Unfriend" 
                        : friendStatus === "request_sent"
                        ? "Cancel Request"
                        : friendStatus === "request_received"
                        ? "Accept Request"
                        : "Send Friend Request"}
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

                  {activeGameRoom && (
                    <button
                      onClick={() => navigate(`/spectator/${activeGameRoom}`)}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Spectate Game
                    </button>
                  )}
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
            {/* <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Recent Games
              </h2>
              
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div key={game.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          game.result === 'win' ? 'bg-green-400' : 
                          game.result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white font-medium">vs {game.opponent}</p>
                          <p className="text-slate-400 text-sm">{game.date} • {game.variant}</p>
                          {game.score && (
                            <p className="text-slate-400 text-xs mt-1">
                              Score: {game.score.player} - {game.score.opponent}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-bold ${
                            game.result === 'win' ? 'text-green-400' : 
                            game.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {game.result.toUpperCase()}
                          </p>
                          <p className="text-slate-400 text-sm">{game.duration}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/game/review/${game.gameId}`)}
                          className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                          title="Review Game"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Right Column - Achievements & Info */}
          <div className="space-y-8">
            {/* <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
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
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Daily Missions
              </h2>
              
              <div className="space-y-3">
                {dailyMissions.map((mission) => {
                  const progressPercent = (mission.progress / mission.target) * 100;
                  const canClaim = mission.completed && !mission.claimed;
                  
                  return (
                    <div key={mission.id} className={`p-4 rounded-lg border ${
                      mission.completed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-slate-700/50 border-slate-600/30'
                    }`}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="text-2xl">{mission.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {mission.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-2">
                            {mission.description}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  mission.completed ? 'bg-green-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs whitespace-nowrap">
                              {mission.progress}/{mission.target}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              {mission.reward.coins > 0 && (
                                <span>💰 {mission.reward.coins} coins</span>
                              )}
                              {mission.reward.xp > 0 && (
                                <span>⭐ {mission.reward.xp} XP</span>
                              )}
                            </div>
                            {canClaim && (
                              <button
                                onClick={() => {
                                  // TODO: Replace with real API call when backend endpoint is ready
                                  const updated = dailyMissions.map(m => 
                                    m.id === mission.id ? { ...m, claimed: true } : m
                                  );
                                  setDailyMissions(updated);
                                  alert(`Claimed ${mission.reward.coins} coins and ${mission.reward.xp} XP!`);
                                }}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Claim
                              </button>
                            )}
                            {mission.claimed && (
                              <span className="text-green-400 text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Claimed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */}

            {/* Quick Stats */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Games Played</span>
                  <span className="text-white font-semibold">
                    {stats.gamesPlayed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Streak</span>
                  <span className="text-white font-semibold">{stats.currentStreak} wins</span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span className="text-slate-300">Favorite Mode</span>
                  <span className="text-white font-semibold">Ranked</span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Best ELO</span>
                  <span className="text-white font-semibold">{stats.bestElo}</span>
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