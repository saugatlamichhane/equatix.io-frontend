import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api";

const ChallengesPage = () => {
  const { user } = useAuth();
  const [sentChallenges, setSentChallenges] = useState([]);
  const [receivedChallenges, setReceivedChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [sentRes, receivedRes] = await Promise.all([
          api.get("/challenge/sent"),
          api.get("/challenge/received"),
        ]);

        const sent = sentRes.data.challenges || [];
        const received = receivedRes.data.challenges || [];
        
        // Separate active and completed challenges
        const activeSent = sent.filter(c => c.status === "pending" || c.status === "accepted");
        const activeReceived = received.filter(c => c.status === "pending" || c.status === "accepted");
        
        // Combine completed challenges (any status that's not pending or accepted)
        const completedSent = sent.filter(c => c.status !== "pending" && c.status !== "accepted");
        const completedReceived = received.filter(c => c.status !== "pending" && c.status !== "accepted");
        const combinedCompleted = [...completedSent, ...completedReceived];
        
        setSentChallenges(activeSent);
        setReceivedChallenges(activeReceived);
        setCompletedChallenges(combinedCompleted);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user]);

  const handleAccept = async (challengeId) => {
    try {
      await api.put(`/challenge/accept/${challengeId}`);
      setReceivedChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId ? { ...c, status: "accepted" } : c
        )
      );
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const handleReject = async (challengeId) => {
    try {
      await api.put(`/challenge/reject/${challengeId}`);
      setReceivedChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    } catch (error) {
      console.error("Error rejecting challenge:", error);
    }
  };

  const handleJoin = (challengeId) => {
    // 👇 navigate to the challenge game page
    navigate(`/challenge/${challengeId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-300">Loading challenges...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">🎯 Challenges</h1>
          <div></div> {/* Empty div for spacing */}
        </div>

        {/* Received Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Received Challenges</h2>
          {receivedChallenges.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center ring-1 ring-white/10">
              <p className="text-slate-300">No received challenges.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedChallenges.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        c.status === 'pending' ? 'bg-yellow-400' : 
                        c.status === 'accepted' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-white font-semibold">From: {c.challenger_id}</p>
                        <p className="text-slate-400 text-sm">Status: {c.status}</p>
                      </div>
                    </div>

                    {c.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(c.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {c.status === "accepted" && (
                      <button
                        onClick={() => handleJoin(c.id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Join Game
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Challenges */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Sent Challenges</h2>
          {sentChallenges.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center ring-1 ring-white/10">
              <p className="text-slate-300">No sent challenges.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentChallenges.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        c.status === 'pending' ? 'bg-yellow-400' : 
                        c.status === 'accepted' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-white font-semibold">To: {c.opponent_id}</p>
                        <p className="text-slate-400 text-sm">Status: {c.status}</p>
                      </div>
                    </div>

                    {c.status === "accepted" && (
                      <button
                        onClick={() => handleJoin(c.id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Join Game
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">📜 Game History</h2>
            <div className="space-y-4">
              {completedChallenges.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors opacity-75"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        c.status === 'rejected' ? 'bg-red-400' : 'bg-slate-400'
                      }`} />
                      <div>
                        <p className="text-white font-semibold">
                          {c.challenger_id === user?.uid ? `vs ${c.opponent_id}` : `vs ${c.challenger_id}`}
                        </p>
                        <p className="text-slate-400 text-sm capitalize">Status: {c.status}</p>
                        <p className="text-slate-500 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
