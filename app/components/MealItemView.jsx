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
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import authService from "../services/authService";
// import CachedImage from "./CachedImage"; // Tuto řádku jsme odstranili
// import { getOptimizedImageUri, preloadImages } from "../utils/imageUtils"; // Tuto řádku jsme odstranili
import { Image } from "expo-image"; // <-- NOVÝ IMPORT PRO EXPO-IMAGE

const { height } = Dimensions.get("window");

const MealItemView = ({ meal, onClose }) => {
  const modalAnimation = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [mealDetails, setMealDetails] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Kód pro preloadImages jsme odstranili, protože expo-image to zvládá automaticky
  useEffect(() => {
    if (meal && meal.imageUris && meal.imageUris.length > 0) {
      console.log("Meal ID:", meal.id, "Images:", meal.imageUris);
      console.log("Image count:", meal.imageUris.length);

      meal.imageUris.forEach((uri, i) => {
        console.log(`Image ${i}: ${uri}`);
      });
      // preloadImages(meal.imageUris); // Tato řádka je odstraněna
    }
  }, [meal]);

  const fetchUserDetails = async () => {
    if (!meal.user_id) return;

    try {
      setIsLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (modalVisible && meal.user_id) {
      fetchUserDetails();
    } else {
      setMealDetails({});
    }
  }, [modalVisible, meal.user_id]);

  useEffect(() => {
    if (modalVisible) {
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
      }).start(() => {
        modalAnimation.setValue(height);
        onClose();
      });
    }
  }, [modalVisible]);

  useEffect(() => {
    console.log("MealItemView modal visible:", modalVisible);
  }, [modalVisible]);

  const handlePhonePress = () => {
    setShowPhoneNumber(!showPhoneNumber);
  };

  const copyToClipboard = () => {
    if (mealDetails.ownerNumber) {
      Clipboard.setString(mealDetails.ownerNumber);

      setCopyFeedback(true);

      if (Platform.OS === "android") {
        ToastAndroid.show("Phone number copied!", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Copied",
          "Phone number copied to clipboard!",
          [{ text: "OK", onPress: () => {} }],
          { cancelable: true }
        );
      }
      setTimeout(() => {
        setCopyFeedback(false);
      }, 2000);
    }
  };

  const onRefresh = async () => {
    console.log("Refreshing meal details...");
    setRefreshing(true);

    await fetchUserDetails();
  };

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007bff", "#01766A"]}
            tintColor="#007bff"
            title="Pull to refresh..."
            titleColor="#999"
          />
        }>
        {/* Images first */}
        <ScrollView
          horizontal={true}
          style={styles.imageScroll}
          showsHorizontalScrollIndicator={false}>
          {meal.imageUris &&
            meal.imageUris.map((uri, index) => {
              // Zde je klíčová změna: Používáme Image z expo-image
              // a předáváme čisté URI bez cacheBust
              // const cacheBustUri = `${uri}${uri.includes("?") ? "&" : "?"}t=${Date.now()}`; // Tuto řádku jsme odstranili
              console.log(`Rendering image ${index}:`, uri); // Teď logujeme čisté URI
              return (
                <Image // <-- Používáme komponentu Image z expo-image
                  key={`meal-${meal.id || "unknown"}-image-${index}`}
                  source={{ uri: uri }} // <-- Předáváme čisté URI
                  style={styles.detailImage}
                  contentFit="cover" // <-- Používáme contentFit místo resizeMode
                  // Volitelně můžete přidat placeholder nebo blurhash pro lepší UX
                  // placeholder={{ blurhash: 'LKNK9@xuxuay' }}
                />
              );
            })}
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
                  {/* Add a Text component for accessibility */}
                  <Text style={{ display: "none" }}>Copy</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Meal name third */}
        <Text style={styles.modalTitle}>{meal.name}</Text>

        {/* Description last */}
        <Text style={styles.modalDescription}>{meal.description}</Text>
      </ScrollView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      style={{
        justifyContent: "flex-end",
      }}>
      <View
        style={[
          styles.modalOverlay,
          { zIndex: 10, pointerEvents: modalVisible ? "auto" : "none" },
        ]}>
        <Animated.View
          style={[styles.modalContent, { height: modalAnimation }]}>
          {renderContent()}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
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
    zIndex: 10,
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
    // resizeMode: "cover", // Tohle nahrazujeme contentFit v expo-image
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
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#01766A",
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
    color: "#01766A",
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
  contentContainer: {
    flex: 1,
  },
});

export default MealItemView;
