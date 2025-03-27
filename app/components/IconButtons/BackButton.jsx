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
    router.back(); // Use router.back() to go to the previous page
    setTimeout(() => (isClicking.current = false), 500);
  };

  return (
    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
      <MaterialIcons name="arrow-back" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    // Your chat button styles here
  },
});

export default BackButton;
