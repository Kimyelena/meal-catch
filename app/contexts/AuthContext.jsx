import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state - this was empty before
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getUser();
        setUser(currentUser);
        console.log("Auth initialized with user:", currentUser ? currentUser.$id : "none");
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Add silent parameter to avoid triggering global loading state
  const refreshUser = async (silent = false) => {
    try {
      // Only set loading if not in silent mode
      if (!silent) setLoading(true);
      
      console.log("Refreshing user data from server...");
      const currentUser = await authService.getUser(true);
      console.log("Refreshed user data:", currentUser);
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    } finally {
      // Only update loading state if not in silent mode
      if (!silent) setLoading(false);
    }
  };

  // Implement login, register and logout functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      if (response.error) {
        return { error: response.error };
      }
      
      const currentUser = await authService.getUser();
      setUser(currentUser);
      return { user: currentUser };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, number) => {
    try {
      setLoading(true);
      const response = await authService.register(email, password, name, number);
      if (response.error) {
        return { error: response.error };
      }
      
      const currentUser = await authService.getUser();
      setUser(currentUser);
      return { user: currentUser };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
