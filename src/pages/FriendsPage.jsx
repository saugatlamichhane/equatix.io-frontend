import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    axios
      .get(`https://equatix-io-backend.onrender.com/api/friends/${user.uid}`)
      .then((res) => setFriends(res.data.friends));
  }, [user]);

  const handleUnfriend = async (friendUid) => {
    try {
      await axios.delete(
        "https://equatix-io-backend.onrender.com/api/friends",
        {
          data: {
            myUid: user.uid,
            friendUid: friendUid,
          },
        }
      );

      setFriends(friends.filter((friend) => friend.uid !== friendUid));
    } catch (error) {
      console.error("Unfriend failed:", error);
    }
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`);
  };

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
                    <img src={friend.photo} className="w-12 h-12 rounded-full" />
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
