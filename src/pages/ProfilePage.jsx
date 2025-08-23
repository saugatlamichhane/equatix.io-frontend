// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authContext";

const ProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  // New state to track if a challenge exists between current user and profile user
  const [hasChallenge, setHasChallenge] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `https://equatix-io-backend.onrender.com/api/profile/${uid}`
        );
        setProfile(res.data.profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    const checkFriend = async () => {
      if (!user || !uid || user.uid === uid) return;

      try {
        const res = await axios.get(
          `https://equatix-io-backend.onrender.com/api/friends/${user.uid}`
        );
        const friendUids = res.data.friends.map((f) => f.uid);
        setIsFriend(friendUids.includes(uid));
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setIsFriend(false);
      }
    };

    const fetchChallenges = async () => {
      if (!user || !uid || user.uid === uid) {
        setHasChallenge(false);
        return;
      }

      try {
        const res = await axios.get(
          `https://equatix-io-backend.onrender.com/api/challenges/${user.uid}`
        );
        // Check if a challenge exists with this profile user
        const exists = res.data.challenges.some((challenge) => {
          const participants = [
            challenge.challengerUid,
            challenge.challengedUid,
          ];
          const relevantStatus = ["pending", "accepted", "in_progress"];
          return (
            participants.includes(uid) &&
            participants.includes(user.uid) &&
            relevantStatus.includes(challenge.status)
          );
        });
        setHasChallenge(exists);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        setHasChallenge(false);
      }
    };

    fetchProfile();
    checkFriend();
    fetchChallenges();
  }, [uid, user]);

  const handleFriendToggle = async () => {
    if (!user) return;

    try {
      if (isFriend) {
        await axios.delete(
          "https://equatix-io-backend.onrender.com/api/friends",
          {
            data: { myUid: user.uid, friendUid: uid },
          }
        );
        setIsFriend(false);
      } else {
        await axios.post(
          "https://equatix-io-backend.onrender.com/api/friends",
          {
            myUid: user.uid,
            friendUid: uid,
          }
        );
        setIsFriend(true);
      }
    } catch (error) {
      console.error("Failed to update friends:", error);
    }
  };

  const handleChallenge = async () => {
    if (!user) return;

    if (user.uid === uid) {
      alert("You can't challenge yourself!");
      return;
    }

    if (hasChallenge) {
      alert("You already have a pending or ongoing challenge with this user.");
      return;
    }

    try {
      const createRes = await axios.post(
        "https://equatix-io-backend.onrender.com/api/challenges",
        {
          challengerUid: user.uid,
          challengedUid: uid,
        }
      );

      if (createRes.data.success) {
        alert("🎯 Challenge sent!");
        setHasChallenge(true);
      } else {
        alert("⚠️ Failed to send challenge.");
      }
    } catch (err) {
      console.error("Challenge error:", err);
      alert("❌ Error sending challenge.");
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading profile...</div>;

  if (!profile)
    return <div className="text-center mt-10 text-red-500">User not found</div>;

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow mt-10 bg-white">
      <div className="flex items-center gap-4">
        <img
          src={profile.photo}
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-gray-600 text-sm">UID: {profile.uid}</p>
          <p className="text-blue-600 font-semibold">Elo: {profile.elo}</p>
        </div>
      </div>

      <div className="mt-6 space-y-1">
        <p>🏆 Wins: {profile.wins}</p>
        <p>💔 Losses: {profile.losses}</p>
        <p>⚖️ Draws: {profile.draws}</p>
      </div>

      {user && user.uid !== uid && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleFriendToggle}
            className={`px-4 py-2 rounded text-white ${
              isFriend ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {isFriend ? "Unfriend" : "Add Friend"}
          </button>

          <button
            onClick={handleChallenge}
            disabled={hasChallenge}
            className={`px-4 py-2 rounded text-white ${
              hasChallenge ? "bg-gray-500 cursor-not-allowed" : "bg-purple-500"
            }`}
          >
            {hasChallenge ? "Challenge Pending" : "Challenge"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
