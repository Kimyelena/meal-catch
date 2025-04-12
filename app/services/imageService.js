import storageService from "./storageService";
import { config } from "./appwrite";

const imageService = {
  async uploadImagesAndGetUrls(imageUris) {
    console.log("Bucket ID:", config.bucketId);
    if (!config.bucketId) {
      const errorMessage =
        "Error: bucketId is not defined. Check your environment variables.";
      console.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    if (!Array.isArray(imageUris) || imageUris.length === 0) {
      console.warn("imageUris is empty or not an array. Skipping upload.");
      return Promise.resolve([]);
    }

    try {
      const uploadResults = await Promise.all(
        imageUris.map(async (originalUri) => {
          try {
            console.log(`Uploading image: ${originalUri}`);

            let blob;
            let mimeType = "image/jpeg"; // Default, change as needed!

            if (originalUri.startsWith("file://")) {
              try {
                const fileContent = await readFile(originalUri, "base64");
                // **DETERMINE THE CORRECT MIME TYPE HERE!**
                // Example (very basic, unreliable):
                if (originalUri.toLowerCase().endsWith(".png")) {
                  mimeType = "image/png";
                } else if (
                  originalUri.toLowerCase().endsWith(".jpg") ||
                  originalUri.toLowerCase().endsWith(".jpeg")
                ) {
                  mimeType = "image/jpeg";
                }
                blob = new Blob([fileContent], { type: mimeType });
              } catch (readFileError) {
                console.error(
                  `Error reading file ${originalUri}:`,
                  readFileError
                );
                throw new Error(`Could not read file: ${originalUri}`);
              }
            } else {
              const response = await fetch(originalUri);
              if (!response.ok) {
                throw new Error(
                  `HTTP error ${response.status} fetching ${originalUri}`
                );
              }
              try {
                blob = await response.blob();
                mimeType = blob.type; // Use the type from the response
              } catch (blobError) {
                console.error(
                  `Error creating blob from fetch for ${originalUri}:`,
                  blobError
                );
                throw new Error(
                  `Could not create blob from fetch: ${originalUri}`
                );
              }
            }

            console.log("Blob:", blob);
            console.log("Blob Type:", mimeType);
            console.log("Blob Size:", blob.size);

            const uploadResult = await storageService.uploadFile(
              blob,
              config.bucketId
            );

            if (uploadResult.error) {
              const uploadErrorMessage = `Upload failed for ${originalUri}: ${uploadResult.error}`;
              console.error(uploadErrorMessage);
              throw new Error(uploadErrorMessage);
            }

            const uploadedFileId = uploadResult.data;
            console.log(`Uploaded file ID: ${uploadedFileId}`);

            const imageUrl = await storageService.getFileViewUrl(
              uploadedFileId,
              config.bucketId
            );

            if (!imageUrl) {
              const urlErrorMessage = `Failed to get file view URL for: ${originalUri}`;
              console.error(urlErrorMessage);
              throw new Error(urlErrorMessage);
            }

            console.log(`Generated URL: ${imageUrl}`);
            return imageUrl;
          } catch (processingError) {
            console.error(
              `Error processing image ${originalUri}:`,
              processingError
            );
            return Promise.reject(processingError);
          }
        })
      );

      return uploadResults;
    } catch (overallError) {
      console.error("Error uploading images:", overallError);
      return null;
    }
  },
};

export default imageService;
