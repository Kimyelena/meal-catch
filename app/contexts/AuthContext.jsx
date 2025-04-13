import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
// ...existing imports...

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ...existing state...

  // Initialize auth state
  useEffect(() => {
    // ...existing initialization code...
  }, []);

  // Add a function to refresh the user data
  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ...existing methods like login, register, logout...

  const value = {
    user,
    loading,
    // ...existing context values...
    login: async (email, password) => {
      // ...existing login code...
    },
    register: async (email, password, name, number) => {
      // ...existing register code...
    },
    logout: async () => {
      // ...existing logout code...
    },
    refreshUser, // Add the refreshUser function to the context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
