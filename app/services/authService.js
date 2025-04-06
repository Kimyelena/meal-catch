// authService.js
import { account, databases } from "./appwrite";
import { ID, Query } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID;

const authService = {
  // Register a user
  async register(email, password, name, number) {
    try {
      // 1. Create account
      const accountResponse = await account.create(
        ID.unique(),
        email,
        password
      );
      if (accountResponse.error) throw accountResponse.error; //  Throw if there's an error

      // 2. Login
      const loginResponse = await account.createEmailPasswordSession(
        email,
        password
      );
      if (loginResponse.error) throw loginResponse.error; //  Throw if there's an error

      // 3. Update Name (Appwrite specific)
      const updateNameResponse = await account.updateName(name);
      if (updateNameResponse.error) throw updateNameResponse.error;

      // 4. Create user document in database
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
  async getUser() {
    try {
      const userAccount = await account.get();
      if (!userAccount) {
        return null;
      }

      const documents = await databases.listDocuments(dbId, colId, [
        Query.equal("user_id", userAccount.$id),
      ]);

      if (documents.total > 0 && documents.documents.length > 0) {
        return {
          ...userAccount,
          number: documents.documents[0].number, // Include number here
        };
      } else {
        return userAccount; // Or handle as needed
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
        Query.equal("user_id", userId),
      ]);

      if (documents.total > 0 && documents.documents.length > 0) {
        return {
          number: documents.documents[0].number, // Correct key
          ...documents.documents[0],
        };
      }
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  },
};

async function updateUserNameAndNumber(userId, newName, newNumber) {
  try {
    console.log(
      "Updating user:",
      userId,
      "name:",
      newName,
      "number:",
      newNumber
    );

    const documents = await databases.listDocuments(dbId, colId, [
      Query.equal("user_id", userId),
    ]);

    if (documents.total > 0 && documents.documents.length > 0) {
      const documentId = documents.documents[0].$id;
      console.log("Found document ID:", documentId);

      const updateData = {
        name: newName,
        number: String(newNumber),
      };
      console.log("Update data:", updateData);

      const updatedDocument = await databases.updateDocument(
        dbId,
        colId,
        documentId,
        updateData
      );

      console.log("updateDocument result:", updatedDocument);

      if (updatedDocument && updatedDocument.$id) {
        console.log("Update successful:", updatedDocument);
        return { success: true, updatedDocument };
      } else if (updatedDocument && updatedDocument.error) {
        // Check for error
        console.error("Update failed:", updatedDocument.error);
        return { success: false, error: updatedDocument.error };
      } else {
        console.error("Update failed: Unknown reason");
        return { success: false, error: "Database update failed" };
      }
    } else {
      console.log("User not found:", userId);
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Database update error:", error);
    return { success: false, error: error.message };
  }
}

export default authService;
