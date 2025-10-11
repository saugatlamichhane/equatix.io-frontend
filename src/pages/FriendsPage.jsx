// src/pages/FriendsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Axios instance with auth

const FriendsPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
      try {
        setLoading(true);
        // Just list all friends
        const res = await api.get("/Friends");
        setFriends(res.data.players || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

  const handleUnfriend = async (friendUid) => {
    try {
      await api.delete(`/Friends/${friendUid}`);
      setFriends(friends.filter((f) => f.uid !== friendUid));
    } catch (err) {
      console.error("Unfriend failed:", err);
      setError("Failed to remove friend.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-300">Loading friends...</div>
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Friends</h1>
        {friends.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center ring-1 ring-white/10">
            <p className="text-slate-300">No friends added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => goToProfile(friend.uid)}
                  >
                    {/* Optionally show profile photo if available */}
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                      {friend.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{friend.name}</p>
                      <p className="text-sm text-slate-400">UID: {friend.uid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfriend(friend.uid)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Unfriend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
