// app/index.js

import React from "react"; // Import React
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PostItImage from "../assets/images/meal-catch-logo.png"; // Adjust path if needed
import { useRouter } from "expo-router";
// Removed useAuth and useEffect - redirection is handled by the layout

const HomeScreen = () => {
  const router = useRouter();

  // This component now just renders the landing page.
  // It will only be shown if:
  // 1. Auth loading is complete (handled in _layout.js)
  // 2. User is null (handled in _layout.js redirect logic)
  console.log("Rendering HomeScreen (Landing Page UI)");

  return (
    <View style={styles.container}>
      <Image source={PostItImage} style={styles.image} />
      <Text style={styles.title}>Welcome To Meals App</Text>
      <Text style={styles.subtitle}>
        Capture your thoughts anytime, anywhere
      </Text>

      <TouchableOpacity
        style={styles.button}
        // Decide where this button should go. '/account' often holds login/signup.
        onPress={() => router.push("/account")}>
        <Text style={styles.buttonText}>Get Started / Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles --- (Copied from your previous version)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // centeredContainer style is not needed here anymore
});

export default HomeScreen;
