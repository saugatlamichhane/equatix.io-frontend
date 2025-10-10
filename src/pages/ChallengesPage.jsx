import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // <-- Import the Axios instance

const ChallengesPage = () => {
  const { user } = useAuth();
  const [sentChallenges, setSentChallenges] = useState([]);
  const [receivedChallenges, setReceivedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch sent challenges
        const sentRes = await api.get("/challenge/sent");
        setSentChallenges(sentRes.data.challenges || []);

        // Fetch received challenges
        const receivedRes = await api.get("/challenge/received");
        setReceivedChallenges(receivedRes.data.challenges || []);
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
      setReceivedChallenges((prev) =>
        prev.filter((c) => c.id !== challengeId)
      );
    } catch (error) {
      console.error("Error rejecting challenge:", error);
    }
  };

  if (loading) return <div>Loading challenges...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Challenges</h1>

      {/* Received Challenges */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Received Challenges</h2>
        {receivedChallenges.length === 0 && <p>No received challenges.</p>}
        {receivedChallenges.map((c) => (
          <div
            key={c.id}
            className="p-2 border rounded mb-2 flex justify-between items-center"
          >
            <span>
              From: {c.challenger_id} | Status: {c.status}
            </span>
            {c.status === "pending" && (
              <div className="space-x-2">
                <button
                  onClick={() => handleAccept(c.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sent Challenges */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Sent Challenges</h2>
        {sentChallenges.length === 0 && <p>No sent challenges.</p>}
        {sentChallenges.map((c) => (
          <div
            key={c.id}
            className="p-2 border rounded mb-2 flex justify-between items-center"
          >
            <span>
              To: {c.opponent_id} | Status: {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesPage;
