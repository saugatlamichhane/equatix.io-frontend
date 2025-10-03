// src/components/LeaderboardPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // Import the Axios instance
import { useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/Leaderboard'); // Uses baseURL from api.js
        setPlayers(res.data.players || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-300">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

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
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.uid}
                    className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => goToProfile(player.uid)}
                  >
                    <td className="p-4 text-slate-300 font-medium">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* If photo is available in backend later, add it here */}
                        <span className="text-white font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{player.elo}</td>
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