// app/_layout.js

import React, { useState, useEffect } from "react"; // Import React and hooks
import { Stack, useRouter, usePathname } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
        router.replace("/meals");
      }
    }
  }, [user, loading, pathname, router]);

  const AccountIcon = () => (
    <TouchableOpacity
      onPress={() => router.push("/account")}
      style={{ marginRight: 15 }}>
      <MaterialIcons name="account-circle" size={28} color="#fff" />
    </TouchableOpacity>
  );
  const NotificationIcon = () => (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      style={{ marginRight: 15 }}>
      <MaterialIcons name="notifications" size={28} color="#fff" />
    </TouchableOpacity>
  );
  const ChatButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/chat")}
      style={styles.chatButton}>
      <MaterialIcons name="chat" size={32} color="#007bff" />
    </TouchableOpacity>
  );

  const BackButton = () => (
    <TouchableOpacity
      onPress={() => router.replace("/meals")}
      style={styles.backButton}>
      <MaterialIcons name="arrow-back" size={28} color="#fff" />
    </TouchableOpacity>
  );

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

  console.log(
    "AppContent Render: Rendering Stack and UI. User:",
    user ? user.$id : "None"
  );
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ff8c00" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <NotificationIcon />
              <AccountIcon />
            </View>
          ),
          headerLeft: () => (pathname !== "/meals" ? <BackButton /> : null),
        }}>
        {/* Screens are usually defined by files in `app` directory.
            You might not need these Stack.Screen declarations if you have
            app/account.js, app/chat.js, app/notifications.js.
            The Stack component automatically finds and configures them.
            Only declare here if needed for specific options overriding file conventions. */}
        <Stack.Screen name="account" options={{ title: "Account" }} />
        <Stack.Screen name="chat" options={{ title: "Chat" }} />
        <Stack.Screen
          name="notifications"
          options={{ title: "Notifications" }}
        />
      </Stack>

      {/* Floating Buttons and Modal - Only show if logged in */}
      {user && (
        <>
          <View style={styles.buttonContainer}>
            <ChatButton />
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
  console.log("RootLayout Render: Setting up AuthProvider.");
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    zIndex: 10,
  },
  openModalButton: {
    backgroundColor: "#007bff",
    borderRadius: 40,
    width: 80,
    height: 80,
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
  chatButton: {
    marginBottom: 10,
  },
  backButton: {
    marginLeft: 10,
  },
});

export default RootLayout;
