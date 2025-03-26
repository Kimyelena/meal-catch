import React from "react";
import { View, Text } from "react-native";

const NotificationsLayout = ({ children }) => {
  return (
    <View>
      <Text>Notifications Layout</Text>
      {children}
    </View>
  );
};

export default NotificationsLayout;
