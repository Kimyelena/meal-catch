import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const currentUser = await authService.getUser();
      if (currentUser && !currentUser.error) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response?.error) {
        return response;
      }

      await checkUserStatus();
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, number) => {
    setLoading(true);
    try {
      const result = await authService.register(email, password, name, number);

      if (result?.error) {
        setLoading(false);
        return { error: result.error };
      }

      //  If registration and login are successful, set user in context
      //  (You'll need to fetch the user details here, adjust to your needs)
      const userDetails = await authService.getUser(); //  Fetch user details
      setUser(userDetails);

      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("authContext.register error:", error);
      setLoading(false);
      return { error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await authService.logout(); // Assuming your logout function
      router.replace("/(auth)"); // Navigate to login
    } catch (error) {
      console.error("Logout error:", error);
      // Handle the error (e.g., show an alert)
    }
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
