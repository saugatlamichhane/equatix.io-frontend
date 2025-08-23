// src/components/Login.jsx
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import googleLogo from "../assets/google.png";
import equatixLogo from "../assets/equatixLogo.png"; // Import your game logo

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send token to backend
      await fetch("https://baghchal-io-backend.onrender.com/api/auth/google", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 🔁 Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {" "}
      {/* Use flex-col and center items */}
      {/* Game Logo */}
      <div className="mb-8">
        {" "}
        {/* Add margin-bottom for spacing */}
        <img
          src={equatixLogo} // Your game logo
          alt="Equatix Game Logo"
          className="w-48 h-auto" // Adjust width as needed for your logo size
        />
      </div>
      {/* Login Button */}
      <button onClick={handleLogin}>
        <img src={googleLogo} alt="Sign in with Google" className="w-50" />{" "}
        {/* Smaller Google logo */}
      </button>
    </div>
  );
};

export default Login;
