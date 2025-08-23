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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Rank</th>
              <th className="p-2">Player</th>
              <th className="p-2">Elo</th>
              <th className="p-2">Games Played</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.uid} className="border-t border-gray-200">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={player.photo}
                      alt="profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{player.name}</span>
                  </div>
                </td>
                <td className="p-2">{player.elo}</td>
                <td className="p-2">{player.gamesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
