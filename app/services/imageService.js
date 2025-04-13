import storageService from "./storageService";
import { config } from "./appwrite";
import * as FileSystem from "expo-file-system";

const imageService = {
  async uploadImagesAndGetUrls(imageUris) {
    console.log(
      "uploadImagesAndGetUrls received:",
      Array.isArray(imageUris) ? `${imageUris.length} images` : imageUris
    );

    if (!config.bucketId) {
      console.error("Error: bucketId is not defined");
      return [];
    }

    // Handle both single URI string and array of URIs
    const urisArray = Array.isArray(imageUris) ? imageUris : [imageUris];

    if (urisArray.length === 0) {
      console.warn("No images to upload");
      return [];
    }

    const uploadedUrls = [];

    for (const uri of urisArray) {
      if (!uri || typeof uri !== "string") {
        console.warn("Skipping invalid URI:", uri);
        continue;
      }

      try {
        console.log("Processing image URI:", uri);

        // Verify the file exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            console.error("File does not exist:", uri);
            continue;
          }
        } catch (fileCheckError) {
          console.error("Error checking file:", fileCheckError);
          continue;
        }

        // Create a file object with necessary metadata
        const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType =
          fileExt === "png"
            ? "image/png"
            : fileExt === "gif"
            ? "image/gif"
            : "image/jpeg";

        const fileObject = {
          uri: uri,
          name: `image-${Date.now()}.${fileExt}`,
          type: mimeType,
        };

        console.log("Sending file object to storage service:", fileObject.name);

        // Upload the file
        const result = await storageService.uploadFile(fileObject);

        if (result.error) {
          console.error("Upload failed:", result.error);
          continue;
        }

        // Get the URL from the file ID
        if (result.data) {
          const fileId = result.data;
          const fileUrl = storageService.getFileViewUrl(fileId);

          if (fileUrl) {
            console.log("Generated URL:", fileUrl);
            uploadedUrls.push(fileUrl);
          }
        }
      } catch (error) {
        console.error("Error processing image:", error);
        // Continue with next image
      }
    }

    console.log(`Final uploaded URLs count: ${uploadedUrls.length}`);
    console.log("Final URLs:", JSON.stringify(uploadedUrls));

    return uploadedUrls;
  },
};

export default imageService;
