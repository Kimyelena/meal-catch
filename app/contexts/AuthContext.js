import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService"; // Verify this path is correct

// It's good practice to provide a default shape, even if null initially
const AuthContext = createContext(null);

// --- MODIFIED AuthProvider ---
export const AuthProvider = ({ children }) => {
  // 1. Accept `children` prop
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading

  useEffect(() => {
    checkUserStatus(); // Renamed for clarity
  }, []);

  const checkUserStatus = async () => {
    // Don't necessarily need setLoading(true) here unless checkUserStatus
    // might be called again later manually. useEffect already starts true.
    // setLoading(true);
    try {
      const currentUser = await authService.getUser();
      // Assuming getUser returns user object on success, null/error otherwise
      // Adjust based on your authService implementation
      if (currentUser && !currentUser.error) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setUser(null); // Ensure user is null on error
    } finally {
      setLoading(false); // Set loading false after check completes
    }
  };

  const login = async (email, password) => {
    setLoading(true); // Show loading during login attempt
    try {
      const response = await authService.login(email, password);
      if (response?.error) {
        return response; // Return error object
      }
      // Login successful, re-fetch user data to update state
      await checkUserStatus(); // This will set user and setLoading to false
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error.message || "Login failed" };
    } finally {
      // Ensure loading is false if checkUserStatus wasn't reached on error
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.register(email, password);
      if (response?.error) {
        return response;
      }
      // Registration successful, proceed to login
      return await login(email, password); // This will handle user state and loading
    } catch (error) {
      console.error("Registration error:", error);
      return { error: error.message || "Registration failed" };
    } finally {
      // Ensure loading is false if login wasn't reached
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout service error:", error);
    } finally {
      setUser(null); // Clear user state immediately
      setLoading(false); // Stop loading
      // No need to call checkUserStatus after logout, user is known to be null
    }
  };

  // Memoize the context value if performance becomes an issue, but not strictly necessary now
  const contextValue = {
    user,
    login,
    register,
    logout,
    loading,
    // You could expose checkUserStatus if needed:
    // refreshUser: checkUserStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children} {/* 2. Render children inside the Provider */}
    </AuthContext.Provider>
  );
};

// --- MODIFIED useAuth hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Add check to ensure it's used within the provider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// You probably don't need the default export if using named exports
// export default AuthProvider;
