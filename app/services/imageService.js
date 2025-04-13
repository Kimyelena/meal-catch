import storageService from "./storageService";
import { config } from "./appwrite";
import * as FileSystem from 'expo-file-system';

const imageService = {
  async uploadImagesAndGetUrls(imageUris) {
    console.log("uploadImagesAndGetUrls received:", imageUris);
    
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
      if (!uri || typeof uri !== 'string') {
        console.warn("Skipping invalid URI:", uri);
        continue;
      }
      
      try {
        console.log("Processing image URI:", uri);
        
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          console.error("File does not exist:", uri);
          continue;
        }
        
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Determine MIME type from URI extension
        let mimeType = "image/jpeg"; // default
        if (uri.toLowerCase().endsWith('.png')) mimeType = "image/png";
        if (uri.toLowerCase().endsWith('.gif')) mimeType = "image/gif";
        
        // Create blob
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            resolve(xhr.response);
          };
          xhr.onerror = function() {
            reject(new Error('Failed to create blob'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', `data:${mimeType};base64,${base64}`, true);
          xhr.send(null);
        });
        
        console.log("Created blob:", blob.size, "bytes,", "type:", blob.type);
        
        // Upload the blob
        const result = await storageService.uploadFile(blob);
        
        if (result.error) {
          console.error("Upload failed:", result.error);
          continue;
        }
        
        // Get the URL and add it to our results
        const fileId = result.data;
        const fileUrl = storageService.getFileViewUrl(fileId);
        
        if (fileUrl) {
          console.log("Generated URL:", fileUrl);
          uploadedUrls.push(fileUrl);
        }
      } catch (error) {
        console.error("Error processing image:", error);
        // Continue with next image
      }
    }
    
    console.log("Final uploaded URLs:", uploadedUrls);
    return uploadedUrls;
  }
};

export default imageService;
