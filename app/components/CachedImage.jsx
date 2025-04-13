import React, { useState, useEffect } from "react";
import { Image, ActivityIndicator, View, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";

const CachedImage = ({ uri, style, resizeMode = "cover" }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!uri) {
          setLoading(false);
          return;
        }

        // Generate a unique filename based on the URI
        const filename = uri.split("/").pop();
        const cacheDir = `${FileSystem.cacheDirectory}images/`;
        const cacheFilePath = `${cacheDir}${filename}`;

        // Check if directory exists, create it if not
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, {
            intermediates: true,
          });
        }

        // Check if file exists in cache
        const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);

        if (fileInfo.exists) {
          // Use cached file
          setImageUri(cacheFilePath);
          setLoading(false);
        } else {
          // Download and cache file
          const downloadResult = await FileSystem.downloadAsync(
            uri,
            cacheFilePath
          );
          if (downloadResult.status === 200) {
            setImageUri(downloadResult.uri);
          } else {
            setImageUri(uri); // Fallback to original URI
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error caching image:", error);
        setImageUri(uri); // Fallback to original URI
        setLoading(false);
      }
    };

    loadImage();
  }, [uri]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri || uri }}
      style={style}
      resizeMode={resizeMode}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});

export default CachedImage;
