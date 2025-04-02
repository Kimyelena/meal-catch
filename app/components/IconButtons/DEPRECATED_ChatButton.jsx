import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatButton = () => {
  const router = useRouter();
  const isClicking = useRef(false);

  const handleChatPress = () => {
    if (isClicking.current) {
      return;
    }

    isClicking.current = true;
    router.push("/chat");

    setTimeout(() => {
      isClicking.current = false;
    }, 500);
  };

  return (
    <TouchableOpacity onPress={handleChatPress}>
      <MaterialIcons name="chat" size={32} color="#007bff" />
    </TouchableOpacity>
  );
};

export default ChatButton;
