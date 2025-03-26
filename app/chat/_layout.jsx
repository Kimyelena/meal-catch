import React from "react";
import { View, Text } from "react-native";

const ChatLayout = ({ children }) => {
  return (
    <View>
      <Text>Chat Layout</Text>
      {children}
    </View>
  );
};

export default ChatLayout;
