// authService.js
import { account, databases } from "./appwrite";
import { ID } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID;

const authService = {
  // Register a user
  async register(email, password, name) {
    //removed phoneNumber
    console.log("Register function called with:", { email, password, name });
    try {
      console.log("Attempting account.create...");
      const response = await account.create(ID.unique(), email, password, name);
      console.log("account.create successful. Response:", response);

      console.log("Attempting databases.createDocument...");
      const databaseResponse = await databases.createDocument(
        dbId,
        colId,
        response.$id,
        {
          name: name,
          email: email,
        }
      );
      console.log(
        "databases.createDocument successful. Response:",
        databaseResponse
      );

      // Log the user in immediately after registration
      console.log("Attempting login after registration...");
      const loginResponse = await account.createEmailPasswordSession(
        email,
        password
      );
      console.log(
        "Login after registration successful. Response:",
        loginResponse
      );

      console.log("Register function returning:", {
        ...response,
        databaseResponse,
        loginResponse,
      });
      return { ...response, databaseResponse, loginResponse };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: error.message || "Registration failed. Please try again",
      };
    }
  },
  // Login
  async login(email, password) {
    try {
      const response = await account.createEmailPasswordSession(
        email,
        password
      );
      return response;
    } catch (error) {
      return {
        error: error.message || "Login failed. Please check your credentials",
      };
    }
  },
  // Get logged in user
  async getUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },
  // Logout user
  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      return {
        error: error.message || "Logout failed. Please try again",
      };
    }
  },
};

export default authService;
