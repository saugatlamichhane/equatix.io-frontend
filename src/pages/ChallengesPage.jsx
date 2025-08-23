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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Challenges</h1>
      {challenges.length === 0 && (
        <p className="text-gray-500">No active challenges.</p>
      )}
      {challenges.map((challenge) => (
        <div
          key={challenge._id}
          className="bg-white shadow-md rounded-xl p-4 mb-4"
        >
          <div className="flex items-center gap-4">
            <img
              src={challenge.opponent?.photo}
              alt="opponent"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{challenge.opponent?.name}</p>
              <p className="text-sm text-gray-600">
                {challenge.challengerUid === user.uid
                  ? "You challenged them"
                  : "They challenged you"}
              </p>
              <p className="text-sm mt-1">
                <strong>Status:</strong>{" "}
                <span className="capitalize">{challenge.status}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            {challenge.status === "pending" &&
              challenge.challengedUid === user.uid && (
                <>
                  <button
                    onClick={() => handleAccept(challenge._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(challenge._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}

            {(challenge.status === "accepted" ||
              challenge.status === "in_progress") && (
              <button
                onClick={() => handleJoin(challenge._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {challenge.status === "accepted" ? "Join Game" : "Resume Game"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChallengesPage;
