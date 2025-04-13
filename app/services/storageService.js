import { storage, config } from "./appwrite";
import { ID } from "react-native-appwrite";

const storageService = {
  async uploadFile(file) {
    if (!file) {
      console.error("No file provided to uploadFile");
      return { error: "No file provided" };
    }

    try {
      console.log("Uploading file to bucket:", config.bucketId);
      const fileId = ID.unique();

      const uploadedFile = await storage.createFile(
        config.bucketId,
        fileId,
        file
      );

      console.log("Upload successful, file ID:", uploadedFile.$id);
      return { data: uploadedFile.$id };
    } catch (error) {
      console.error("Error in storageService.uploadFile:", error);
      return { error: error.message };
    }
  },

  getFileViewUrl(fileId) {
    if (!fileId) {
      console.error("No fileId provided to getFileViewUrl");
      return null;
    }

    try {
      // The correct order is bucketId first, then fileId
      const fileUrl = storage.getFileView(config.bucketId, fileId);
      return fileUrl;
    } catch (error) {
      console.error("Error getting file view URL:", error);
      return null;
    }
  },
};

export default storageService;
