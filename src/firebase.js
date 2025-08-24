// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8LHioOE0QbnljDBiTI3Fax8abCqNkcDs",
  authDomain: "equatix-io.firebaseapp.com",
  projectId: "equatix-io",
  storageBucket: "equatix-io.firebasestorage.app",
  messagingSenderId: "791194109963",
  appId: "1:791194109963:web:32140f91366afb171f5f0e",
  measurementId: "G-KV8HB7VEK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth + Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Optional: Initialize analytics (only works in browser environments)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export for use in Login.jsx
export { auth, provider, analytics };
