import { account, databases } from "./appwrite";
import { ID, Query } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID;

const authService = {
  // Register a user
  async register(email, password, name, number) {
    try {
      const accountResponse = await account.create(
        ID.unique(),
        email,
        password
      );
      if (accountResponse.error) throw accountResponse.error;
      const loginResponse = await account.createEmailPasswordSession(
        email,
        password
      );
      if (loginResponse.error) throw loginResponse.error;
      const updateNameResponse = await account.updateName(name);
      if (updateNameResponse.error) throw updateNameResponse.error;
      const databaseResponse = await databases.createDocument(
        dbId,
        colId,
        accountResponse.$id,
        {
          name: name,
          email: email,
          number: number,
          user_id: accountResponse.$id,
        }
      );
      if (databaseResponse.error) throw databaseResponse.error;

      return { accountResponse, databaseResponse, loginResponse };
    } catch (error) {
      console.error("authService.register error:", error);
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
  async getUser(forceRefresh = false) {
    try {
      const userAccount = await account.get();
      if (!userAccount) {
        return null;
      }

      // Added logging for debugging
      console.log("Got user account:", userAccount.$id);

      // Always fetch the latest user data from the database
      const documents = await databases.listDocuments(dbId, colId, [
        Query.equal("user_id", userAccount.$id),
      ]);

      console.log("Fetched user documents count:", documents.documents.length);
      
      if (documents.total > 0 && documents.documents.length > 0) {
        const userDoc = documents.documents[0];
        console.log("User document found with phone:", userDoc.number);
        
        // Create a new user object with all account properties plus the number
        return {
          ...userAccount,
          number: userDoc.number,
        };
      } else {
        console.log("No user document found, returning just account data");
        return userAccount;
      }
    } catch (error) {
      console.error("Error getting user:", error);
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

  async getUserDetails(userId) {
    try {
      const documents = await databases.listDocuments(dbId, colId, [
        Query.equal("$id", userId),
      ]);

      if (documents.total > 0 && documents.documents.length > 0) {
        return {
          number: documents.documents[0].number,
          name: documents.documents[0].name,
          ...documents.documents[0],
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  },

  async updateUserNameAndNumber(userId, name, number) {
    try {
      console.log("Updating user:", { userId, name, number });

      if (!userId) {
        console.error("User ID is missing for update operation");
        return {
          success: false,
          error: "User ID is required",
        };
      }

      // Prepare the update data
      const updateData = {
        name: name || "",
        number: number || "",
      };

      console.log("Update data:", updateData);

      // First, find the document with user_id equal to userId
      const userDocs = await databases.listDocuments(dbId, colId, [
        Query.equal("user_id", userId),
      ]);
      
      let docId;
      if (userDocs.total > 0) {
        docId = userDocs.documents[0].$id;
        console.log("Found user document ID:", docId);
      } else {
        console.error("No user document found with user_id:", userId);
        return {
          success: false,
          error: "User document not found",
        };
      }

      // Update the user document using the document ID
      const updatedDocument = await databases.updateDocument(
        dbId,
        colId,
        docId,
        updateData
      );

      console.log("User updated successfully:", updatedDocument);

      return {
        success: true,
        updatedDocument,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message || "Failed to update user",
      };
    }
  },
};

export default authService;
