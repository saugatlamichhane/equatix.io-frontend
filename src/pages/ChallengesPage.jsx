import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authContext";

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchChallenges = async () => {
      const res = await axios.get(
        `https://equatix-io-backend.onrender.com/api/challenges/${user.uid}`
      );
      setChallenges(res.data.challenges);
    };
    fetchChallenges();
  }, [user]);

  const updateChallengeLocally = (id, newData) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch._id === id ? { ...ch, ...newData } : ch))
    );
  };

  const handleAccept = async (id) => {
    try {
      await axios.post(
        "https://equatix-io-backend.onrender.com/api/challenges/accept",
        { challengeId: id }
      );
      updateChallengeLocally(id, { status: "in_progress" });
    } catch (err) {
      console.error("Failed to accept challenge", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        "https://equatix-io-backend.onrender.com/api/challenges/reject",
        { challengeId: id }
      ); // You should implement this on backend
      setChallenges((prev) => prev.filter((ch) => ch._id !== id));
    } catch (err) {
      console.error("Failed to reject challenge", err);
    }
  };

  const handleJoin = (id) => {
    navigate(`/challenge/${id}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Challenges</h1>
          <p className="text-slate-300">Manage your active challenges and games</p>
        </div>

        {challenges.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Active Challenges</h3>
            <p className="text-slate-400 mb-6">Challenge friends or wait for someone to challenge you!</p>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors">
              Find Players
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={challenge.opponent?.photo}
                      alt="opponent"
                      className="w-16 h-16 rounded-full ring-2 ring-slate-600"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-white">{challenge.opponent?.name}</h3>
                      <p className="text-slate-400">
                        {challenge.challengerUid === user.uid
                          ? "You challenged them"
                          : "They challenged you"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-300">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          challenge.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          challenge.status === "accepted" ? "bg-green-500/20 text-green-400" :
                          challenge.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>
                          {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {challenge.status === "pending" &&
                      challenge.challengedUid === user.uid && (
                        <>
                          <button
                            onClick={() => handleAccept(challenge._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(challenge._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                    {(challenge.status === "accepted" ||
                      challenge.status === "in_progress") && (
                      <button
                        onClick={() => handleJoin(challenge._id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                      >
                        {challenge.status === "accepted" ? "Join Game" : "Resume Game"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
