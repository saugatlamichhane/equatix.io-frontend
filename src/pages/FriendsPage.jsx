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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your Friends</h1>
      {friends.length === 0 ? (
        <p>No friends added yet.</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li
              key={friend.uid}
              className="flex items-center justify-between border p-3 rounded"
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => goToProfile(friend.uid)}
              >
                <img src={friend.photo} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-sm text-gray-500">UID: {friend.uid}</p>
                </div>
              </div>
              <button
                onClick={() => handleUnfriend(friend.uid)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Unfriend
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsPage;
