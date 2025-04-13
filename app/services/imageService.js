import storageService from './storageService';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { config } from './appwrite';

const imageService = {
  /**
   * Uploads multiple images and returns their URLs
   * @param {Array} imageUris - Array of image URIs to upload
   * @returns {Promise<Array>} - Promise with array of uploaded image URLs
   */
  async uploadImagesAndGetUrls(imageUris) {
    if (!imageUris || imageUris.length === 0) {
      console.log("No images to upload");
      return [];
    }

    console.log(`uploadImagesAndGetUrls received: ${imageUris.length} images`);

    // Check if configuration is available
    if (!config || !config.bucketId) {
      console.error("Storage bucket ID is not configured properly");
      throw new Error('Storage bucket ID is not configured. Check your appwrite.js configuration.');
    }

    try {
      const uploadPromises = imageUris.map(async (uri) => {
        // Handle different URI formats based on platform
        let fileUri = uri;
        if (uri.startsWith('file://') && Platform.OS === 'ios') {
          fileUri = uri.replace('file://', '');
        }

        console.log(`Processing image: ${fileUri}`);

        try {
          // Upload the file using storageService
          const uploadResult = await storageService.uploadFile(fileUri);
          
          if (!uploadResult || !uploadResult.data) {
            console.error("Upload failed, no result data returned");
            return null;
          }
          
          // Get the file view URL
          const fileId = uploadResult.data;
          const fileUrl = storageService.getFileViewUrl(fileId);
          
          console.log(`Successfully uploaded image. File ID: ${fileId}, URL: ${fileUrl}`);
          return fileUrl;
        } catch (error) {
          console.error(`Error uploading individual image: ${error.message}`);
          return null;
        }
      });

      // Wait for all uploads to complete and filter out failed uploads
      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter(url => url !== null);
      
      console.log(`Successfully uploaded ${validUrls.length} of ${imageUris.length} images`);
      return validUrls;
    } catch (error) {
      console.error("Error in uploadImagesAndGetUrls:", error);
      throw error;
    }
  }
};

export default imageService;
