import { Platform, Image } from "react-native";

// Create a safe version of image manipulator functions
let ImageManipulator = null;
let canManipulate = false;

// Try to import ImageManipulator safely
try {
  // Only attempt to import if we're not in a web environment where it might not be supported
  if (Platform.OS !== "web") {
    ImageManipulator = require("expo-image-manipulator");
    canManipulate = true;
  }
} catch (err) {
  console.warn(
    "expo-image-manipulator not available, image optimization disabled",
    err
  );
  canManipulate = false;
}

// Optimize image for upload - gracefully handle missing dependency
export const optimizeImage = async (uri) => {
  // If ImageManipulator is not available, return the original URI
  if (!canManipulate || !ImageManipulator) {
    console.log("Image optimization skipped - manipulator not available");
    return uri;
  }

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error("Error optimizing image:", error);
    return uri; // Return original uri if optimization fails
  }
};

// Optimize image URIs for display, adding cache busting if needed
export const getOptimizedImageUri = (uri) => {
  if (!uri) return null;

  // Always return the original URI without modification
  // We'll add cache busting parameters later when rendering
  return uri;
};

// Preload images to improve display performance
export const preloadImages = (imageUris) => {
  if (!imageUris || !imageUris.length) return;

  console.log(`Preloading ${imageUris.length} images`);

  imageUris.forEach((uri, index) => {
    // Add unique timestamp for each prefetch
    const optimizedUri = `${uri}?prefetch=true&index=${index}&t=${Date.now()}`;
    console.log(
      `Preloading image ${index + 1}/${imageUris.length}: ${optimizedUri}`
    );

    if (optimizedUri) {
      Image.prefetch(optimizedUri).catch((error) => {
        console.warn(`Failed to preload image ${index}: ${error}`);
      });
    }
  });
};

// Bundle functions into a default export
const imageUtils = {
  optimizeImage,
  getOptimizedImageUri,
  preloadImages,
  isOptimizationAvailable: canManipulate,
};

export default imageUtils;
