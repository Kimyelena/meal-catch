import { storage, config } from "./appwrite";
import { ID } from "appwrite";

const storageService = {
  async uploadFile(fileId) {
    //file parameter is now blob or file object.
    try {
      const uploadedFile = await storage.createFile(
        config.bucketId,
        ID.unique(),
        fileId
      );
      return { data: uploadedFile.$id };
    } catch (error) {
      return { error: error.message };
    }
  },

  async getFileViewUrl(fileId) {
    try {
      console.log("Get File View File ID:", fileId);
      console.log("Get File View Bucket ID:", config.bucketId);
      const fileUrl = storage.getFileView(fileId, config.bucketId);
      return fileUrl;
    } catch (error) {
      console.error("Error getting file view URL:", error);
      return null;
    }
  },
};

export default storageService;
