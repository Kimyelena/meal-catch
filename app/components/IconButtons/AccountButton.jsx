import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { account } from "../../services/appwrite";

const AccountButton = () => {
  const router = useRouter();
  const isClicking = useRef(false);

  const handleChatPress = () => {
    if (isClicking.current) {
      return;
    }

    isClicking.current = true;
    router.push("/account");

    setTimeout(() => {
      isClicking.current = false;
    }, 500);
  };

  return (
    <TouchableOpacity onPress={handleChatPress}>
      <MaterialIcons name="account-circle" size={32} color="#fff" />
    </TouchableOpacity>
  );
};

export default AccountButton;
