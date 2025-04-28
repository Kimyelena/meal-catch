import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const prefetchImage = async (uri) => {
  try {
    const response = await fetch(uri, { method: "HEAD" });
    return response.ok; // Returns true if the URL is valid
  } catch (error) {
    console.error("Error prefetching image:", uri, error);
    return false;
  }
};

const MealCard = ({ item, onPress }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isValidImage, setIsValidImage] = useState(false);

  useEffect(() => {
    const validateImage = async () => {
      const isValid = await prefetchImage(item.imageUris[0]);
      setIsValidImage(isValid);
    };
    validateImage();
  }, [item.imageUris]);

  return (
    <TouchableOpacity style={styles.mealCard} onPress={() => onPress(item)}>
      {!imageLoaded && !imageError && (
        <ActivityIndicator
          style={styles.imageLoader}
          size="small"
          color="#007bff"
        />
      )}
      <Image
        style={styles.mealImage}
        source={
          imageError || !isValidImage
            ? require("../../assets/placeholder.png") // Fallback image
            : { uri: item.imageUris[0] }
        }
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.error("Failed to load image:", item.imageUris[0]);
          setImageError(true);
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    width: 137,
    aspectRatio: 1,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  imageLoader: {
    position: "absolute",
    alignSelf: "center",
  },
});

export default MealCard;
