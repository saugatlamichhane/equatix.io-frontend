import React, { useState, useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserCheck, UserX, UserPlus, Clock, Trophy } from "lucide-react";
import api from "../utils/api";

const FindPlayersPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({}); // Map of uid -> status
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!user) return;
      try {
        // Fetch all friend data using new endpoints
        const [friendsRes, incomingRes, sentRes] = await Promise.all([
          api.get("/friends").catch(() => ({ data: { friends: [] } })),
          api.get("/friend-requests").catch(() => ({ data: { requests: [] } })),
          api.get("/friend-requests/sent").catch(() => ({ data: { sentRequests: [] } }))
        ]);

        const friendsList = friendsRes.data.friends || [];
        const incomingList = incomingRes.data.requests || [];
        const sentList = sentRes.data.sentRequests || [];

        setFriends(friendsList);
        setIncomingRequests(incomingList);
        setSentRequests(sentList);

        // Build status map
        const statusMap = {};
        friendsList.forEach(f => { statusMap[f.uid] = "friend"; });
        sentList.forEach(r => { statusMap[r.uid] = "request_sent"; });
        incomingList.forEach(r => { statusMap[r.uid] = "request_received"; });
        setFriendStatuses(statusMap);
      } catch (err) {
        console.error("Error fetching friend data:", err);
      }
    };
    fetchFriendData();
  }, [user]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Search by UID or name
      const res = await api.get(`/Player/${query}`);
      const players = res.data.players || [];
      setResults(players);
      
      // Update friend statuses for search results - statuses are already set in useEffect
      // This ensures new search results get their status from the existing status map
      setFriendStatuses(prevStatuses => {
        const updated = { ...prevStatuses };
        // Statuses should already be set from the useEffect, but ensure all players have a status
        players.forEach(player => {
          if (!updated[player.uid]) {
            updated[player.uid] = "none";
          }
        });
        return updated;
      });
    } catch (err) {
      console.error("Error searching players:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getFriendStatus = (uid) => {
    return friendStatuses[uid] || "none";
  };

  const handleFriendAction = async (friendUid, currentStatus) => {
    try {
      if (currentStatus === "friend") {
        // Unfriend
        const res = await api.delete(`/friend/${friendUid}`);
        if (res.data.success) {
          setFriendStatuses(prev => ({ ...prev, [friendUid]: "none" }));
          setFriends(prev => prev.filter(f => f.uid !== friendUid));
          alert("Friend removed");
        }
      } else if (currentStatus === "request_sent") {
        // Cancel sent request
        const res = await api.delete(`/friend-request/cancel/${friendUid}`);
        if (res.data.success) {
          setFriendStatuses(prev => ({ ...prev, [friendUid]: "none" }));
          setSentRequests(prev => prev.filter(r => r.uid !== friendUid));
          alert("Friend request canceled");
        }
      } else if (currentStatus === "request_received") {
        // Accept incoming request
        const res = await api.post(`/friend-request/accept/${friendUid}`);
        if (res.data.success) {
          setFriendStatuses(prev => ({ ...prev, [friendUid]: "friend" }));
          setIncomingRequests(prev => prev.filter(r => r.uid !== friendUid));
          // Fetch updated friends list
          const friendsRes = await api.get("/friends");
          setFriends(friendsRes.data.friends || []);
          alert("Friend request accepted!");
        }
      } else {
        // Send friend request
        const res = await api.post(`/friend-request/${friendUid}`);
        if (res.data.success) {
          setFriendStatuses(prev => ({ ...prev, [friendUid]: "request_sent" }));
          // Add to sent requests (we don't have full user data, but that's okay)
          setSentRequests(prev => [...prev, { uid: friendUid }]);
          alert("Friend request sent!");
        } else {
          alert(res.data.error || "Failed to send friend request");
        }
      }
    } catch (err) {
      console.error("Error handling friend action:", err);
      alert(err.response?.data?.error || "An error occurred");
    }
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

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
            <Search className="w-8 h-8" />
            Find Players
          </h1>
          <div></div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or UID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-700 text-slate-100 placeholder:text-slate-400 border border-slate-600 px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((player) => {
              const status = getFriendStatus(player.uid);
              const isOwnProfile = user && player.uid === user.uid;
              
              return (
                <div
                  key={player.uid}
                  className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex flex-col items-center text-center mb-4">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/50 cursor-pointer mb-3"
                        onClick={() => goToProfile(player.uid)}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl cursor-pointer mb-3"
                        onClick={() => goToProfile(player.uid)}
                      >
                        {player.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <p
                      className="font-semibold text-white text-lg cursor-pointer hover:text-indigo-400 transition-colors mb-1"
                      onClick={() => goToProfile(player.uid)}
                    >
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>ELO: {Math.round(player.elo || 0)}</span>
                    </div>
                    {status === "request_sent" && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                        Request Sent
                      </span>
                    )}
                    {status === "request_received" && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        Request Received
                      </span>
                    )}
                    {status === "friend" && (
                      <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded-full">
                        Friend
                      </span>
                    )}
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToProfile(player.uid)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        View Profile
                      </button>
                      {status === "friend" && (
                        <button
                          onClick={() => handleFriendAction(player.uid, status)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
                          title="Unfriend"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      {status === "request_sent" && (
                        <button
                          onClick={() => handleFriendAction(player.uid, status)}
                          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-colors text-sm"
                          title="Cancel Request"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {status === "request_received" && (
                        <button
                          onClick={() => handleFriendAction(player.uid, status)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                        >
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </button>
                      )}
                      {status === "none" && (
                        <button
                          onClick={() => handleFriendAction(player.uid, status)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add
                        </button>
                      )}
                    </div>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => goToProfile(player.uid)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      View My Profile
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center ring-1 ring-white/10">
            <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg mb-2">
              {loading ? "Searching players..." : "No players found"}
            </p>
            <p className="text-slate-500 text-sm">
              {!loading && "Enter a name or UID to search for players"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayersPage;
