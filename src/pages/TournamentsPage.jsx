import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, Trophy, Plus, ChevronRight, ArrowLeft } from "lucide-react";

const sampleTournaments = [
  {
    id: "t1",
    name: "Equatix Open #1",
    startTime: "2025-10-05T18:00:00Z",
    players: 64,
    maxPlayers: 128,
    status: "upcoming",
    format: "Single Elimination",
    prize: "1,000 Coins",
  },
  {
    id: "t2",
    name: "Weekend Rapid Cup",
    startTime: "2025-10-04T15:00:00Z",
    players: 24,
    maxPlayers: 32,
    status: "ongoing",
    format: "Swiss (5 Rounds)",
    prize: "Exclusive Badge",
  },
  {
    id: "t3",
    name: "Beginners Bracket",
    startTime: "2025-09-28T12:00:00Z",
    players: 32,
    maxPlayers: 32,
    status: "finished",
    format: "Single Elimination",
    prize: "500 Coins",
  },
];

const TournamentsPage = () => {
  const [tab, setTab] = useState("upcoming");
  const navigate = useNavigate();

  const filtered = useMemo(
    () => sampleTournaments.filter((t) => t.status === tab),
    [tab]
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Tournaments</h1>
            <p className="text-slate-300">Compete in scheduled events and win rewards</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            Create Tournament
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 rounded-xl p-2 ring-1 ring-white/10 mb-6 inline-flex">
          {[
            { k: "upcoming", label: "Upcoming" },
            { k: "ongoing", label: "Ongoing" },
            { k: "finished", label: "Past" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.k ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <div key={t.id} className="bg-slate-800/50 rounded-xl p-5 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{t.name}</h3>
                  <p className="text-slate-400 text-sm">{t.format}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  t.status === "upcoming"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : t.status === "ongoing"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}>
                  {t.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{new Date(t.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>
                    {t.players} / {t.maxPlayers} players
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>{t.prize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Approx 2h</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors">
                  {t.status === "upcoming" ? "Join" : t.status === "ongoing" ? "Watch" : "View"}
                </button>
                <button className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                  View details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bracket Placeholder */}
        {tab !== "finished" && (
          <div className="mt-8 bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Bracket Preview</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[1,2,3,4].map((round) => (
                <div key={round} className="space-y-3">
                  <div className="text-slate-400 text-sm">Round {round}</div>
                  {[...Array(Math.max(1, 8 / (2 ** (round - 1))))].map((_, i) => (
                    <div key={i} className="bg-slate-700/50 rounded p-3 text-white">Match {i + 1}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
