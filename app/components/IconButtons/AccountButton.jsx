import React, { useRef } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const AccountButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isClicking = useRef(false);

  const handleAccountPress = () => {
    if (isClicking.current) {
      return;
    }

    console.log("Current pathname:", router.pathname); // Debugging line

    if (pathname !== "/(account)") {
      isClicking.current = true;
      router.push("/(account)");
      setTimeout(() => {
        isClicking.current = false;
      }, 500);
    }
  };

  return (
    <TouchableOpacity onPress={handleAccountPress}>
      <MaterialIcons name="account-circle" size={32} color="#fff" />
    </TouchableOpacity>
  );
};

export default AccountButton;
