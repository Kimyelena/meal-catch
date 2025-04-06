import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const BackButton = () => {
  const router = useRouter();
  const isClicking = useRef(false);

  const handleBackPress = () => {
    if (isClicking.current) return;

    isClicking.current = true;
    router.replace("/(meals)"); // Always redirect to /meals
    setTimeout(() => (isClicking.current = false), 500);
  };

  return (
    <TouchableOpacity onPress={handleBackPress}>
      <MaterialIcons name="arrow-back" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

export default BackButton;
