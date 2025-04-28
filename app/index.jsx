import React from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PostItImage from "../assets/images/icon.png";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={PostItImage} style={styles.image} />
      {/* <Text style={styles.title}>Welcome To MealC Catch</Text> */}
      <Text style={styles.subtitle}>
        Share your culinary adventures with the world, one bite at a time!
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log("Get Started button pressed"); // Debug log
          router.push("/(auth)");
        }}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#018786",
  },
  image: {
    width: 500,
    height: 500,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 70,
    paddingHorizontal: 20, // Add horizontal padding
    alignSelf: "center", //
  },
  button: {
    backgroundColor: "#FFC107",
    paddingVertical: 15, // Increased padding for a larger button
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HomeScreen;
