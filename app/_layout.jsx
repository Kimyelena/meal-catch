import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import AccountButton from "./components/IconButtons/AccountButton";
import BackButton from "./components/IconButtons/BackButton";

import mealService from "../app/services/mealService";

const AppContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Account");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Move useCallback to the top with other hooks
  const getHeaderTitle = useCallback(() => {
    return user ? `Hello! ${user.name}` : "Account";
  }, [user]);

  // Update header title when user changes
  useEffect(() => {
    if (user && user.name) {
      setHeaderTitle(`Hello! ${user.name}`);
    } else {
      setHeaderTitle("Account");
    }
  }, [user]);

  console.log("AppContent: useAuth() returned:", { user, loading });

  // Only redirect on initial load, not on subsequent auth state changes
  useEffect(() => {
    if (loading) {
      console.log("AppContent Effect: Still loading auth state...");
      return;
    }

    console.log("AppContent Effect: Auth loading finished. User:", user);

    // Only redirect if this is the initial load and we're on the home page
    if (user && !initialLoadComplete && pathname === "/") {
      console.log(
        "AppContent Effect: Initial user load, redirecting from / to /meals"
      );
      router.replace("/(meals)");
    }

    // Mark initial load as complete
    setInitialLoadComplete(true);
  }, [user, loading, pathname, router, initialLoadComplete]);

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

  if (loading && !initialLoadComplete) {
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
            // Use the dynamic title that updates with user state
            title: headerTitle,
          }}
        />
      </Stack>

      {user && (
        <>
          <View style={styles.buttonContainer}>
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
});

export default RootLayout;
