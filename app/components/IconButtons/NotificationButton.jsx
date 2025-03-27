import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const NotificationButton = () => {
  const router = useRouter();
  const isClicking = useRef(false); // Initialize useRef to false

  const handleChatPress = () => {
    if (isClicking.current) {
      return; // Prevent multiple clicks
    }

    isClicking.current = true; // Indicate a click is in progress
    router.push("/notifications");

    setTimeout(() => {
      isClicking.current = false; // Reset after a delay
    }, 500);
  };

  return (
    <TouchableOpacity
      onPress={handleChatPress}
      style={styles.notificationButton}>
      <MaterialIcons name="notifications" size={32} color="#007bff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    // Your chat button styles here
  },
});

export default NotificationButton;
