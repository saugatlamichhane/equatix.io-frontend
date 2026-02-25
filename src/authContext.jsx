// src/authContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "./utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBackendSynced, setIsBackendSynced] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if(firebaseUser) {
        try {
          const response = await api.get('/login');
          if(response.status === 200) {
            setIsBackendSynced(true);
          } else {
            setIsBackendSynced(false);
          }
        } catch (error) {
          console.error('Backend sync failed:', error);
          setIsBackendSynced(false);
        }
      } else {
        setIsBackendSynced(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isBackendSynced, setIsBackendSynced }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
