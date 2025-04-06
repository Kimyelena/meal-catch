// app/_layout.js

import React, { useState, useEffect, useRef } from "react"; // Import React and hooks
import { Stack, useRouter, usePathname } from "expo-router";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import { AuthProvider, useAuth } from "../app/contexts/AuthContext";
import AddMealModal from "../app/components/AddMealModal";
// import ChatButton from "./components/IconButtons/ChatButton";
import AccountButton from "./components/IconButtons/AccountButton";
// import NotificationButton from "./components/IconButtons/NotificationButton";
import BackButton from "./components/IconButtons/BackButton";

import mealService from "../app/services/mealService";

const AppContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  console.log("AppContent: useAuth() returned:", { user, loading });

  useEffect(() => {
    if (loading) {
      console.log("AppContent Effect: Still loading auth state...");
      return;
    }

    console.log("AppContent Effect: Auth loading finished. User:", user);

    if (user) {
      if (pathname === "/") {
        console.log(
          "AppContent Effect: User found, redirecting from / to /meals"
        );
        router.replace("/(meals)");
      }
    }
  }, [user, loading, pathname, router]);

  const handleModalAddMeal = async (
    name,
    description,
    imageUris,
    tags,
    category
  ) => {
    if (!user || !user.$id) {
      Alert.alert("Error", "You must be logged in to add a meal.");
      return;
    }
    console.log(`AppContent: Adding meal for user ${user.$id}`);
    try {
      const result = await mealService.addMeal(
        user.$id,
        name,
        description,
        imageUris,
        tags,
        category
      );
      if (result.error) {
        Alert.alert("Error", `Failed to add meal: ${result.error}`);
      } else {
        Alert.alert("Success", "Meal added successfully!");
      }
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  if (loading) {
    console.log("AppContent Render: Showing loading indicator");
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#018786" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              {/* <NotificationButton /> */}
              <AccountButton />
            </View>
          ),
          headerLeft: () => null,
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(meals)" options={{ title: "Browse Meals" }} />
        <Stack.Screen
          name="(account)"
          options={{
            title: user ? `Hello! ${user.name}` : "Account",
          }}
        />
        {/* <Stack.Screen name="chat" options={{ title: "Chat" }} /> */}
        {/* <Stack.Screen
          name="notifications"
          options={{ title: "Notifications" }}
        /> */}
      </Stack>

      {user && (
        <>
          <View style={styles.buttonContainer}>
            {/* <ChatButton /> */}
            <TouchableOpacity
              style={styles.openModalButton}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.openModalButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <AddMealModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            addMeal={handleModalAddMeal}
          />
        </>
      )}
    </View>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  // centeredContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",xw
  // },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    zIndex: 10,
  },
  openModalButton: {
    backgroundColor: "#03dac6",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  openModalButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  // chatButton: {
  //   marginBottom: 10,
  // },
  // backButton: {
  //   marginLeft: 10,
  // },
});

export default RootLayout;
