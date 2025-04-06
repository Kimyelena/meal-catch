import { Storage, ID } from "appwrite";
import client from "./appwrite";

const storage = new Storage(client);
const bucketId = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID;

const imageService = {
  async uploadImageAndGetUrl(imageUris, bucketId) {
    if (!bucketId) {
      console.error(
        "Error: bucketId is not defined. Check your environment variables."
      );
      throw new Error("Bucket ID is not defined"); // Throw an error
    }
    try {
      const response = await fetch(imageUris);
      const blob = await response.blob();

      const uploadFile = await storage.createFile(bucketId, ID.unique(), blob);

      const imageUrl = storage.getFileView(bucketId, uploadFile.$id);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return { error: error.message || "Image upload failed" };
    }
  },
};

export default imageService;
