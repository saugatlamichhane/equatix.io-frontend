import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";

const FindPlayersPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      const res = await axios.get(
        `https://equatix-io-backend.onrender.com/api/friends/${user.uid}`
      );
      setMyFriends(res.data.friends.map((f) => f.uid));
    };
    fetchFriends();
  }, [user]);

  const handleSearch = async () => {
    const res = await axios.get(
      `https://equatix-io-backend.onrender.com/api/search?query=${query}`
    );
    setResults(res.data.results);
  };

  const isFriend = (uid) => myFriends.includes(uid);

  const addFriend = async (friendUid) => {
    await axios.post(`https://equatix-io-backend.onrender.com/api/friends`, {
      myUid: user.uid,
      friendUid,
    });
    setMyFriends([...myFriends, friendUid]);
  };

  const removeFriend = async (friendUid) => {
    await axios.delete(`https://equatix-io-backend.onrender.com/api/friends`, {
      data: { myUid: user.uid, friendUid },
    });
    setMyFriends(myFriends.filter((uid) => uid !== friendUid));
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Find Players</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or UID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {results.length > 0 ? (
        <ul className="space-y-2">
          {results.map((r) => (
            <li
              key={r.uid}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => goToProfile(r.uid)}
              >
                <img src={r.photo} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-gray-500">UID: {r.uid}</p>
                  <p className="text-sm">Elo: {r.elo}</p>
                </div>
              </div>
              {r.uid !== user.uid &&
                (isFriend(r.uid) ? (
                  <button
                    onClick={() => removeFriend(r.uid)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Unfriend
                  </button>
                ) : (
                  <button
                    onClick={() => addFriend(r.uid)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Add Friend
                  </button>
                ))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No players found yet.</p>
      )}
    </div>
  );
};

export default FindPlayersPage;
