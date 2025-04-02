import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const NotificationButton = () => {
  const router = useRouter();
  const isClicking = useRef(false);

  const handleChatPress = () => {
    if (isClicking.current) {
      return;
    }

    isClicking.current = true;
    router.push("/notifications");

    setTimeout(() => {
      isClicking.current = false;
    }, 500);
  };

  return (
    <TouchableOpacity onPress={handleChatPress}>
      <MaterialIcons name="notifications" size={32} color="#007bff" />
    </TouchableOpacity>
  );
};

export default NotificationButton;
