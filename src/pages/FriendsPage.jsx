// src/pages/FriendsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, UserCheck, UserX, Clock, Trophy } from "lucide-react";
import api from "../utils/api";

const FriendsPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("friends"); // 'friends', 'incoming', 'sent'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all friend data in parallel using new backend endpoints
      const [friendsRes, incomingRes, sentRes] = await Promise.all([
        api.get("/friends").catch((err) => {
          console.error("Error fetching friends:", err);
          return { data: { friends: [] } };
        }),
        api.get("/friend-requests").catch((err) => {
          console.error("Error fetching incoming requests:", err);
          return { data: { requests: [] } };
        }),
        api.get("/friend-requests/sent").catch((err) => {
          console.error("Error fetching sent requests:", err);
          return { data: { sentRequests: [] } };
        })
      ]);

      // Handle response format: backend returns {friends: [...]} not {players: [...]}
      setFriends(friendsRes.data.friends || []);
      setIncomingRequests(incomingRes.data.requests || []);
      setSentRequests(sentRes.data.sentRequests || []);
    } catch (err) {
      console.error("Failed to fetch friends data:", err);
      setError("Failed to load friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAcceptRequest = async (friendUid) => {
    try {
      const res = await api.post(`/friend-request/accept/${friendUid}`);
      if (res.data.success) {
        showSuccess(res.data.message || "Friend request accepted!");
        await fetchAllData(); // Refresh all data
      } else {
        setError(res.data.error || "Failed to accept request");
      }
    } catch (err) {
      console.error("Accept failed:", err);
      setError(err.response?.data?.error || "Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (friendUid) => {
    try {
      const res = await api.post(`/friend-request/reject/${friendUid}`);
      if (res.data.success) {
        showSuccess(res.data.message || "Friend request rejected");
        await fetchAllData();
      } else {
        setError(res.data.error || "Failed to reject request");
      }
    } catch (err) {
      console.error("Reject failed:", err);
      setError(err.response?.data?.error || "Failed to reject friend request");
    }
  };

  const handleCancelRequest = async (friendUid) => {
    try {
      const res = await api.delete(`/friend-request/cancel/${friendUid}`);
      if (res.data.success) {
        showSuccess(res.data.message || "Friend request canceled");
        await fetchAllData();
      } else {
        setError(res.data.error || "Failed to cancel request");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      setError(err.response?.data?.error || "Failed to cancel friend request");
    }
  };

  const handleUnfriend = async (friendUid) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    
    try {
      const res = await api.delete(`/friend/${friendUid}`);
      if (res.data.success) {
        showSuccess(res.data.message || "Friend removed");
        await fetchAllData();
      } else {
        setError(res.data.error || "Failed to remove friend");
      }
    } catch (err) {
      console.error("Unfriend failed:", err);
      setError(err.response?.data?.error || "Failed to remove friend");
    }
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading friends...</div>
      </div>
    );
  }

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
            <Users className="w-8 h-8" />
            Friends
          </h1>
          <button
            onClick={() => navigate("/findPlayers")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Find Players
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-green-300">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "friends"
                ? "text-indigo-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Friends
            </div>
            {friends.length > 0 && (
              <span className="ml-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                {friends.length}
              </span>
            )}
            {activeTab === "friends" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "incoming"
                ? "text-indigo-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Requests
            </div>
            {incomingRequests.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {incomingRequests.length}
              </span>
            )}
            {activeTab === "incoming" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "sent"
                ? "text-indigo-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sent
            </div>
            {sentRequests.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {sentRequests.length}
              </span>
            )}
            {activeTab === "sent" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
            )}
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div>
            {friends.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
                <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg mb-2">No friends yet</p>
                <p className="text-slate-500 text-sm mb-4">
                  Start by finding players and sending friend requests!
                </p>
                <button
                  onClick={() => navigate("/findPlayers")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Find Players
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {friend.photo ? (
                        <img
                          src={friend.photo}
                          alt={friend.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 cursor-pointer"
                          onClick={() => goToProfile(friend.uid)}
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                          onClick={() => goToProfile(friend.uid)}
                        >
                          {friend.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="flex-1">
                        <p
                          className="font-semibold text-white cursor-pointer hover:text-indigo-400 transition-colors"
                          onClick={() => goToProfile(friend.uid)}
                        >
                          {friend.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <p className="text-sm text-slate-400">
                            ELO: {Math.round(friend.elo || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToProfile(friend.uid)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleUnfriend(friend.uid)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
                        title="Remove Friend"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Requests Tab */}
        {activeTab === "incoming" && (
          <div>
            {incomingRequests.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
                <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">No incoming requests</p>
                <p className="text-slate-500 text-sm mt-2">
                  Friend requests from other players will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <div
                    key={request.uid}
                    className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => goToProfile(request.uid)}
                      >
                        {request.photo ? (
                          <img
                            src={request.photo}
                            alt={request.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {request.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{request.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <p className="text-sm text-slate-400">
                              ELO: {Math.round(request.elo || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptRequest(request.uid)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.uid)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <UserX className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "sent" && (
          <div>
            {sentRequests.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
                <UserPlus className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">No sent requests</p>
                <p className="text-slate-500 text-sm mt-2">
                  Friend requests you send will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <div
                    key={request.uid}
                    className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => goToProfile(request.uid)}
                      >
                        {request.photo ? (
                          <img
                            src={request.photo}
                            alt={request.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {request.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{request.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <p className="text-sm text-slate-400">
                              ELO: {Math.round(request.elo || 0)}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Pending...</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(request.uid)}
                        className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
