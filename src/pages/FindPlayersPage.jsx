import React, { useState, useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // <-- Use the same Axios instance

const FindPlayersPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/Friends`);
        setMyFriends(res.data.players.map((f) => f.uid));
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    fetchFriends();
  }, [user]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Search by UID or name
      const res = await api.get(`/Player/${query}`);
      setResults(res.data.players || []);
    } catch (err) {
      console.error("Error searching players:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isFriend = (uid) => myFriends.includes(uid);

  const addFriend = async (friendUid) => {
    try {
      await api.post(`/Friends/${friendUid}`); 
      setMyFriends([...myFriends, friendUid]);
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  const removeFriend = async (friendUid) => {
    try {
      await api.delete(`/Friends/${friendUid}`);
      setMyFriends(myFriends.filter((uid) => uid !== friendUid));
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Find Players</h1>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or UID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-800 text-slate-100 placeholder:text-slate-400 border border-slate-600 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((r) => (
              <div
                key={r.uid}
                className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => goToProfile(r.uid)}
                  >
                    {r.photo && <img src={r.photo} className="w-12 h-12 rounded-full" />}
                    <div>
                      <p className="font-semibold text-white">{r.name}</p>
                      <p className="text-sm text-slate-400">UID: {r.uid}</p>
                      <p className="text-sm text-indigo-400 font-medium">Elo: {r.elo}</p>
                    </div>
                  </div>
                  {r.uid !== user.uid &&
                    (isFriend(r.uid) ? (
                      <button
                        onClick={() => removeFriend(r.uid)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Unfriend
                      </button>
                    ) : (
                      <button
                        onClick={() => addFriend(r.uid)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Add Friend
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center ring-1 ring-white/10">
            <p className="text-slate-400">
              {loading ? "Searching players..." : "No players found yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayersPage;
