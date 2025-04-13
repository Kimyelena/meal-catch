import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import authService from "../services/authService";
import CachedImage from "./CachedImage";
import { getOptimizedImageUri, preloadImages } from "../utils/imageUtils";

const { height } = Dimensions.get("window");

const MealItemView = ({ meal, onClose, visible }) => {
  const modalAnimation = useRef(new Animated.Value(height)).current;
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [mealDetails, setMealDetails] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preload images when meal data changes
  useEffect(() => {
    if (meal && meal.imageUris && meal.imageUris.length > 0) {
      preloadImages(meal.imageUris);
    }
  }, [meal]);

  useEffect(() => {
    if (visible && meal.user_id) {
      setIsLoading(true);
      const fetchUserDetails = async () => {
        try {
          const userDetails = await authService.getUserDetails(meal.user_id);
          if (userDetails) {
            setMealDetails({
              ownerName: userDetails.name,
              ownerNumber: userDetails.number,
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserDetails();
    } else {
      setMealDetails({});
    }
  }, [visible, meal.user_id]);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnimation, {
        toValue: height * 0.65,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: height,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const handlePhonePress = () => {
    setShowPhoneNumber(!showPhoneNumber);
  };

  const copyToClipboard = () => {
    if (mealDetails.ownerNumber) {
      Clipboard.setString(mealDetails.ownerNumber);

      // Show feedback that number was copied
      setCopyFeedback(true);

      // Provide feedback based on platform
      if (Platform.OS === "android") {
        ToastAndroid.show("Phone number copied!", ToastAndroid.SHORT);
      } else {
        // For iOS and other platforms
        Alert.alert(
          "Copied",
          "Phone number copied to clipboard!",
          [{ text: "OK", onPress: () => {} }],
          { cancelable: true }
        );
      }

      // Reset the feedback state after a brief delay
      setTimeout(() => {
        setCopyFeedback(false);
      }, 2000);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      );
    }

    return (
      <>
        {/* Images first */}
        <ScrollView horizontal={true} style={styles.imageScroll}>
          {meal.imageUris &&
            meal.imageUris.map((uri, index) => (
              <CachedImage
                key={index}
                uri={getOptimizedImageUri(uri)}
                style={styles.detailImage}
              />
            ))}
        </ScrollView>

        {/* Tags section */}
        <View style={styles.tagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagScrollContent}>
            {meal.tags && meal.tags.length > 0 ? (
              meal.tags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTagsText}>No tags</Text>
            )}
          </ScrollView>
        </View>

        {/* User info second */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userNameText}>By: {mealDetails.ownerName}</Text>
          <TouchableOpacity
            onPress={handlePhonePress}
            style={[
              styles.contactButton,
              showPhoneNumber && styles.phoneNumberButton,
            ]}>
            <View style={styles.phoneContainer}>
              <MaterialIcons
                name={showPhoneNumber ? "phone_enabled" : "phone"}
                size={24}
                color="#01766A" // Changed color for phone icon
              />
              <Text
                style={[
                  styles.phoneText,
                  !showPhoneNumber && styles.questionMarkText,
                  showPhoneNumber && styles.phoneNumberActiveText,
                ]}>
                {showPhoneNumber ? mealDetails.ownerNumber : ""}
              </Text>

              {/* Copy button shown only when phone number is visible */}
              {showPhoneNumber && (
                <TouchableOpacity
                  onPress={copyToClipboard}
                  style={styles.copyButton}>
                  <MaterialIcons
                    name={copyFeedback ? "check" : "content-copy"}
                    size={20}
                    color={copyFeedback ? "#4CAF50" : "#01766A"} // Changed color for copy icon
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Meal name third */}
        <Text style={styles.modalTitle}>{meal.name}</Text>

        {/* Description last */}
        <Text style={styles.modalDescription}>{meal.description}</Text>
      </>
    );
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      style={{
        justifyContent: "flex-end",
      }}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { height: modalAnimation }]}>
          {renderContent()}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  imageScroll: {
    maxHeight: 200,
    marginBottom: 15,
  },
  detailImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    marginRight: 10,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contactButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  phoneNumberButton: {
    backgroundColor: "#e8f5e9", // light green background when showing number
    borderWidth: 1,
    borderColor: "#01766A", // Changed border color for consistency
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 16,
    color: "#007bff",
    marginLeft: 5,
    marginRight: 5,
  },
  phoneNumberActiveText: {
    color: "#01766A", // Changed text color for consistency
    fontWeight: "bold",
  },
  questionMarkText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  copyButton: {
    padding: 5,
    marginLeft: 2,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  tagsContainer: {
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 8,
  },
  tagScrollContent: {
    paddingVertical: 2,
  },
  tagItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
  noTagsText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#999",
  },
});

export default MealItemView;
