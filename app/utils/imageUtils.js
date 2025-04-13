import { Platform } from "react-native";

/**
 * Determines optimal image quality based on device and network
 * @param {string} uri - The image URI
 * @returns {string} - Optimized image URI with quality parameters
 */
export const getOptimizedImageUri = (uri) => {
  if (!uri || typeof uri !== "string") return uri;

  // If it's already a local file or doesn't contain http, return as is
  if (uri.startsWith("file:") || !uri.includes("http")) {
    return uri;
  }

  // For cloud storage providers, add optimization parameters
  if (uri.includes("firebasestorage.googleapis.com")) {
    // For Firebase Storage
    return uri.includes("?")
      ? `${uri}&quality=80&size=600`
      : `${uri}?quality=80&size=600`;
  }

  if (uri.includes("cloudinary.com")) {
    // For Cloudinary
    return uri.replace("/upload/", "/upload/q_auto,w_600/");
  }

  // For other services, you might need different approaches
  // Default case - return original
  return uri;
};

/**
 * Preloads an array of images to cache
 * @param {Array} imageUris - Array of image URIs to preload
 */
export const preloadImages = async (imageUris) => {
  if (!imageUris || !Array.isArray(imageUris)) return;

  // Use Image.prefetch if available in platform
  if (Platform.OS === "ios" || Platform.OS === "android") {
    const { Image } = require("react-native");

    const prefetchPromises = imageUris.map((uri) => {
      if (uri) return Image.prefetch(getOptimizedImageUri(uri));
      return Promise.resolve();
    });

    try {
      await Promise.all(prefetchPromises);
    } catch (error) {
      console.error("Error preloading images:", error);
    }
  }
};
