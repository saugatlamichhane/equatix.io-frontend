import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { Play, Users, Clock, Trophy, Zap } from "lucide-react";

export default function GameHomePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [playersOnline, setPlayersOnline] = useState(1247);
  const [selectedVariant, setSelectedVariant] = useState("normal"); // 'normal', 'blitz', 'marathon'
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const startMatchmaking = () => {
    setIsSearching(true);
    setSearchTime(0);
    // Simulate finding a match after 3-10 seconds
    // In production, this would pass the variant to the backend
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/game/random-match?variant=${selectedVariant}`);
    }, Math.random() * 7000 + 3000);
  };

  const cancelMatchmaking = () => {
    setIsSearching(false);
    setSearchTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Find a Match</h1>
          <p className="text-slate-300">Play against players of similar skill level</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Matchmaking Area */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl p-8 ring-1 ring-white/10 text-center">
              {!isSearching ? (
                <>
                  <div className="text-6xl mb-6">🎯</div>
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Play?</h2>
                  <p className="text-slate-300 mb-8">
                    We'll find you an opponent with similar skill level. 
                    Average wait time is 30 seconds.
                  </p>
                  
                  {/* Game Variant Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Select Game Variant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setSelectedVariant("normal")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedVariant === "normal"
                            ? "bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-300"
                            : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        <Trophy className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <h3 className="text-white font-semibold mb-1">Normal</h3>
                        <p className="text-slate-400 text-sm">Standard gameplay</p>
                        <p className="text-slate-500 text-xs mt-1">~15 min</p>
                      </button>
                      <button
                        onClick={() => setSelectedVariant("blitz")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedVariant === "blitz"
                            ? "bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-300"
                            : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <h3 className="text-white font-semibold mb-1">Blitz</h3>
                        <p className="text-slate-400 text-sm">Fast-paced action</p>
                        <p className="text-slate-500 text-xs mt-1">~5 min</p>
                      </button>
                      <button
                        onClick={() => setSelectedVariant("marathon")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedVariant === "marathon"
                            ? "bg-green-500/20 border-green-400 ring-2 ring-green-300"
                            : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <h3 className="text-white font-semibold mb-1">Marathon</h3>
                        <p className="text-slate-400 text-sm">Extended gameplay</p>
                        <p className="text-slate-500 text-xs mt-1">~30 min</p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={startMatchmaking}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center gap-3 mx-auto"
                  >
                    <Play className="w-6 h-6" />
                    Find Match ({selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)})
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-6 animate-pulse">🔍</div>
                  <h2 className="text-2xl font-bold text-white mb-4">Searching for Opponent...</h2>
                  <p className="text-slate-300 mb-6">
                    Looking for players with similar skill level
                  </p>
                  
                  <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
                    <div className="text-3xl font-mono text-indigo-400 mb-2">
                      {formatTime(searchTime)}
                    </div>
                    <div className="text-slate-400">Search time</div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={cancelMatchmaking}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Cancel Search
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Live Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">Players Online</span>
                  </div>
                  <span className="text-white font-semibold">{playersOnline.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300">Games Today</span>
                  </div>
                  <span className="text-white font-semibold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-slate-300">Your Rating</span>
                  </div>
                  <span className="text-white font-semibold">1,250</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate("/botgame")}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors text-left"
                >
                  🤖 Play vs Bot
                </button>
                <button 
                  onClick={() => navigate("/challenges")}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors text-left"
                >
                  ⚔️ View Challenges
                </button>
                <button 
                  onClick={() => navigate("/leaderboard")}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors text-left"
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

