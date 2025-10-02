import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios
      .get("https://equatix-io-backend.onrender.com/api/leaderboard")
      .then((res) => setPlayers(res.data.players));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">🏆 Leaderboard</h1>
        <div className="bg-slate-800/50 rounded-xl overflow-hidden ring-1 ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-700/50 text-left">
                  <th className="p-4 text-slate-200 font-semibold">Rank</th>
                  <th className="p-4 text-slate-200 font-semibold">Player</th>
                  <th className="p-4 text-slate-200 font-semibold">Elo</th>
                  <th className="p-4 text-slate-200 font-semibold">Games Played</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.uid} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-300 font-medium">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.photo}
                          alt="profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-white font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{player.elo}</td>
                    <td className="p-4 text-slate-300">{player.gamesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
