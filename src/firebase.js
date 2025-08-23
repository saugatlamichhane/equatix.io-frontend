// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqwFUcb46a4AId-uMcCvBiYKbFkdElaoE",
  authDomain: "equatix-io.firebaseapp.com",
  projectId: "equatix-io",
  storageBucket: "equatix-io.firebasestorage.app",
  messagingSenderId: "156158031560",
  appId: "1:156158031560:web:4c760073a985c3309657fd",
  measurementId: "G-LGX237QBJV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
