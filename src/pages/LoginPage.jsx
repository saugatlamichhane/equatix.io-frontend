// src/pages/LoginPage.jsx
import React from "react";
import api from '../utils/api'; // Import the Axios instance

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import googleLogo from "../assets/google.png";
import equatixLogo from "../assets/equatixLogo.png";
import { Play, Trophy, Users, Brain } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log(token);
      // Send token to backend
      // await fetch("https://baghchal-io-backend.onrender.com/api/auth/google", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // });

      // 🔁 Redirect to dashboard
      // const respdata = await api.get('/login');
      // if(respdata.data.success) {
      //   console.log(`Logged in as UID: ${respdata.data.uid}`);
      navigate("/dashboard");

      //}
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left">
          <div className="mb-8">
            <img
              src={equatixLogo}
              alt="Equatix Game Logo"
              className="w-32 h-auto mx-auto lg:mx-0"
            />
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-indigo-400">Equatix.io</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8">
            The ultimate math strategy game. Challenge friends, play against bots, and climb the leaderboards!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <Play className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Play Online</h3>
              <p className="text-slate-400 text-sm">Match with players worldwide</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Compete</h3>
              <p className="text-slate-400 text-sm">Climb the leaderboards</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Challenge Friends</h3>
              <p className="text-slate-400 text-sm">Play with your friends</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Learn</h3>
              <p className="text-slate-400 text-sm">Improve your math skills</p>
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="flex justify-center">
          <div className="bg-slate-800/50 rounded-2xl p-8 ring-1 ring-white/10 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Continue with Google
            </h2>
            
            <p className="text-slate-400 text-center mb-8">
              Sign in to start playing and track your progress
            </p>

            <button 
              onClick={handleLogin} 
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
