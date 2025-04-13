import { databases } from "./appwrite";
import { Query } from "react-native-appwrite";

const databaseService = {
  async getDocument(databaseId, collectionId, documentId) {
    try {
      return await databases.getDocument(databaseId, collectionId, documentId);
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  },

  async listDocuments(databaseId, collectionId, queries = []) {
    try {
      return await databases.listDocuments(databaseId, collectionId, queries);
    } catch (error) {
      console.error("Error listing documents:", error);
      throw error;
    }
  },

  async createDocument(databaseId, collectionId, data, documentId = null) {
    try {
      return await databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  },

  async updateDocument(databaseId, collectionId, documentId, data) {
    try {
      return await databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  async deleteDocument(databaseId, collectionId, documentId) {
    try {
      return await databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
};

export default databaseService;
