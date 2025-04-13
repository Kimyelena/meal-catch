import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {}, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      console.log("Refreshing user data from server...");
      const currentUser = await authService.getUser(true);

      console.log("Refreshed user data:", currentUser);
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const value = {
    user,
    loading,
    login: async (email, password) => {},
    register: async (email, password, name, number) => {},
    logout: async () => {},
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
