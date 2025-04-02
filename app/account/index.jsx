import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import MealItem from "../components/MealItem";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const { width } = Dimensions.get("window");
import mealService from "../services/mealService";
import UserInfoContainer from "../components/UserInfoContainer";

const AccountScreen = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [myMeals, setMyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserMeals = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await mealService.getUsersMeals(user.$id);
          if (response.data) {
            setMyMeals(response.data.data);
            setError(null);
          } else if (response.error) {
            setError(response.error);
          }
        } catch (error) {
          setError("Failed to fetch meals.");
          console.error("Error fetching user meals:", error);
        } finally {
          setLoading(false);
          isFirstRender.current = false; // Set to false after first fetch
        }
      }
    };

    fetchUserMeals();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  const handleSavePhoneNumber = (newPhoneNumber) => {
    console.log("Saving phone number:", newPhoneNumber);
    setUserPhoneNumber(newPhoneNumber);
    // Here you would typically save the newPhoneNumber to your app's state management
    // or make an API call to update the user's phone number in your backend.
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => router.push(`/meal/${item.$id}`)}>
      <Image source={{ uri: item.imageUris[0] }} style={styles.mealImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <View style={styles.content}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {user && (
            <UserInfoContainer
              name={user.name}
              phoneNumber={userPhoneNumber}
              onPhoneNumberSave={handleSavePhoneNumber}
            />
          )}
          {myMeals.length === 0 ? (
            <Text style={styles.noMealsText}>You have no meals</Text>
          ) : (
            <FlatList
              data={myMeals}
              renderItem={renderMealItem}
              keyExtractor={(item) => item.$id}
              numColumns={3}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 0.95, // Take up most of the space
  },
  flatListContent: {
    padding: 10,
    alignItems: "center",
  },
  mealCard: {
    width: (width - 20) / 3,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 3,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  logoutButton: {
    backgroundColor: "#b00020",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  // logoutText: {
  //   color: "#fff",
  //   fontSize: 16,
  // },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },
  noMealsText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default AccountScreen;
