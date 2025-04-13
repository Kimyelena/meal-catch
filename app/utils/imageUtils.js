import { Platform, Image } from 'react-native';

// Create a safe version of image manipulator functions
let ImageManipulator = null;
let canManipulate = false;

// Try to import ImageManipulator safely
try {
  // Only attempt to import if we're not in a web environment where it might not be supported
  if (Platform.OS !== 'web') {
    ImageManipulator = require('expo-image-manipulator');
    canManipulate = true;
  }
} catch (err) {
  console.warn('expo-image-manipulator not available, image optimization disabled', err);
  canManipulate = false;
}

// Optimize image for upload - gracefully handle missing dependency
export const optimizeImage = async (uri) => {
  // If ImageManipulator is not available, return the original URI
  if (!canManipulate || !ImageManipulator) {
    console.log('Image optimization skipped - manipulator not available');
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
    console.error('Error optimizing image:', error);
    return uri; // Return original uri if optimization fails
  }
};

// Get optimized image URI based on device/dimensions
export const getOptimizedImageUri = (uri) => {
  if (!uri) return null;
  // Logic to add any transformations needed for display
  return uri;
};

// Preload images to avoid flicker
export const preloadImages = async (uris) => {
  if (!uris || !Array.isArray(uris)) return;
  
  try {
    // Pre-fetch images on web platforms
    if (Platform.OS === 'web') {
      uris.forEach(uri => {
        if (uri) {
          const img = new Image();
          img.src = uri;
        }
      });
    } else {
      // Use Image.prefetch on native platforms
      await Promise.all(
        uris.map(uri => {
          if (uri) return Image.prefetch(uri);
          return Promise.resolve();
        })
      );
    }
  } catch (error) {
    console.error('Error preloading images:', error);
  }
};

// Bundle functions into a default export
const imageUtils = {
  optimizeImage,
  getOptimizedImageUri,
  preloadImages,
  isOptimizationAvailable: canManipulate
};

export default imageUtils;
