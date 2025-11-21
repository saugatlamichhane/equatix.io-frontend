import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Calendar, Trophy, Users, Clock, Gift, Sparkles } from "lucide-react";

const SeasonalEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    // TODO: Replace with real API call when backend endpoint is ready
    // GET /events/seasonal
    try {
      setLoading(true);
      
      // Mock seasonal events data
      const mockEvents = [
        {
          id: "event-001",
          name: "Halloween Spooktacular",
          description: "Solve spooky puzzles and win special rewards!",
          startDate: "2025-10-25",
          endDate: "2025-11-01",
          active: true,
          image: "🎃",
          challenges: [
            { id: "c1", title: "Win 10 games", reward: "500 coins", progress: 7, target: 10 },
            { id: "c2", title: "Solve 5 puzzles", reward: "Halloween badge", progress: 3, target: 5 }
          ],
          leaderboard: [
            { rank: 1, name: "GhostPlayer", score: 2500 },
            { rank: 2, name: "PumpkinKing", score: 2300 },
            { rank: 3, name: "SpookyMath", score: 2100 }
          ],
          prizes: [
            { rank: 1, reward: "10,000 coins + Exclusive badge" },
            { rank: 2, reward: "5,000 coins + Special avatar" },
            { rank: 3, reward: "2,500 coins" }
          ]
        },
        {
          id: "event-002",
          name: "Winter Wonderland",
          description: "Celebrate the winter season with special challenges!",
          startDate: "2025-12-01",
          endDate: "2025-12-31",
          active: false,
          image: "❄️",
          challenges: [],
          leaderboard: [],
          prizes: []
        },
        {
          id: "event-003",
          name: "New Year Challenge",
          description: "Start the new year with exciting math challenges!",
          startDate: "2026-01-01",
          endDate: "2026-01-07",
          active: false,
          image: "🎉",
          challenges: [],
          leaderboard: [],
          prizes: []
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading events...</div>
      </div>
    );
  }

  const activeEvents = events.filter(e => e.active);
  const upcomingEvents = events.filter(e => !e.active && new Date(e.startDate) > new Date());

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Seasonal Events
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Active Events
            </h2>
            <div className="space-y-6">
              {activeEvents.map((event) => (
                <div key={event.id} className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 ring-2 ring-purple-500/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">{event.image}</div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">{event.name}</h3>
                        <p className="text-slate-300 mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Clock className="w-4 h-4" />
                            {getTimeRemaining(event.endDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenges */}
                  {event.challenges && event.challenges.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Event Challenges</h4>
                      <div className="space-y-2">
                        {event.challenges.map((challenge) => {
                          const progressPercent = (challenge.progress / challenge.target) * 100;
                          return (
                            <div key={challenge.id} className="bg-slate-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">{challenge.title}</span>
                                <span className="text-slate-400 text-sm">
                                  {challenge.progress}/{challenge.target}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-slate-600 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full transition-all"
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-xs">Reward: {challenge.reward}</span>
                                {challenge.progress >= challenge.target && (
                                  <span className="text-green-400 text-xs flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  {event.leaderboard && event.leaderboard.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Leaderboard
                      </h4>
                      <div className="space-y-2">
                        {event.leaderboard.map((entry) => (
                          <div key={entry.rank} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                                entry.rank === 2 ? 'bg-slate-400 text-white' :
                                entry.rank === 3 ? 'bg-orange-600 text-white' :
                                'bg-slate-600 text-slate-300'
                              }`}>
                                {entry.rank}
                              </div>
                              <span className="text-white">{entry.name}</span>
                            </div>
                            <span className="text-indigo-400 font-semibold">{entry.score.toLocaleString()} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prizes */}
                  {event.prizes && event.prizes.length > 0 && (
                    <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Prizes
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {event.prizes.map((prize, idx) => (
                          <div key={idx} className="bg-slate-700/50 rounded-lg p-3 text-center">
                            <div className={`text-2xl font-bold mb-1 ${
                              idx === 0 ? 'text-yellow-400' :
                              idx === 1 ? 'text-slate-300' :
                              'text-orange-400'
                            }`}>
                              #{idx + 1}
                            </div>
                            <p className="text-slate-300 text-sm">{prize.reward}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{event.image}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                      <p className="text-slate-400 text-sm">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    Starts {new Date(event.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
            <Sparkles className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No active or upcoming events</p>
            <p className="text-slate-400 text-sm mt-2">Check back soon for exciting seasonal challenges!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalEventsPage;

