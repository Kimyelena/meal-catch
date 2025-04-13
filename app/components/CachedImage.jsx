import React, { useState, useEffect } from "react";
import { Image, ActivityIndicator, View, StyleSheet, Text } from "react-native";
import * as FileSystem from "expo-file-system";

// Simple hash function to replace crypto dependency
const simpleHash = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Make the hash positive and return as a string
  return Math.abs(hash).toString(16);
};

const CachedImage = ({ uri, style, resizeMode = "cover" }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!uri) {
          setLoading(false);
          setError(true);
          return;
        }

        console.log("Loading image with URI:", uri);

        // Create a safe, unique filename based on the hash of the URI
        const hashValue = simpleHash(uri);
        const timestamp = Date.now().toString(36);
        const filename = `img_${hashValue}_${timestamp}.jpg`; // Always use jpg as extension

        const cacheDir = `${FileSystem.cacheDirectory}img_cache/`;
        const cacheFilePath = `${cacheDir}${filename}`;

        console.log("Cache path:", cacheFilePath);

        // Check if directory exists, create it if not
        try {
          const dirInfo = await FileSystem.getInfoAsync(cacheDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(cacheDir, {
              intermediates: true,
            });
            console.log("Created cache directory:", cacheDir);
          }
        } catch (dirError) {
          console.error("Error creating directory:", dirError);
          // Fall back to using the original URI
          setImageUri(uri);
          setLoading(false);
          return;
        }

        try {
          // Always download the file fresh for now, to avoid caching issues
          console.log("Downloading image:", uri);
          const downloadResult = await FileSystem.downloadAsync(
            uri,
            cacheFilePath
          );

          if (downloadResult.status === 200) {
            console.log("Download successful, using:", downloadResult.uri);
            setImageUri(downloadResult.uri);
          } else {
            console.error(
              "Download failed with status:",
              downloadResult.status
            );
            setImageUri(uri); // Fallback to original URI
          }
        } catch (downloadError) {
          console.error("Download error:", downloadError);
          // Fall back to original URI if download fails
          setImageUri(uri);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in image processing:", error);
        setImageUri(uri); // Fallback to original URI
        setError(false); // Don't show error state, just use original URI
        setLoading(false);
      }
    };

    setLoading(true);
    setError(false);
    loadImage();
  }, [uri]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>!</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri || uri, cache: "reload" }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        console.error("Image render error for URI:", uri);
        // Try fallback to original URI
        if (imageUri !== uri) {
          setImageUri(uri);
        } else {
          setError(true);
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffeeee",
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#cc0000",
  },
});

export default CachedImage;
