import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MealCard from "../components/MealCard";

const { width } = Dimensions.get("window");
import mealService from "../services/mealService";
import UserInfoContainer from "../components/UserInfoContainer";
import MealItem from "../components/MealItem";

const AccountScreen = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [setUserPhoneNumber] = useState("");
  const [myMeals, setMyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isMealModalVisible, setIsMealModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserMeals = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const response = await mealService.getUsersMeals(user.$id);
        if (response.data && response.data.documents) {
          setMyMeals(response.data.documents || []);
          setError(null);
        } else if (response.error) {
          setError(response.error);
          setMyMeals([]);
        } else {
          setMyMeals([]);
          setError("Invalid data structure received from server");
        }
      } catch (error) {
        setError("Failed to fetch meals.");
        console.error("Error fetching user meals:", error);
        setMyMeals([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUserMeals();
  }, [fetchUserMeals]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  const handleSavePhoneNumber = async (newPhoneNumber) => {
    console.log("Saving phone number:", newPhoneNumber);
    setUserPhoneNumber(newPhoneNumber);

    await fetchUserMeals();
  };
  const handleMealPress = (meal) => {
    console.log("AccountScreen: handleMealPress - Opening modal");
    setSelectedMeal(meal);
  };

  const handleModalClose = () => {
    console.log("AccountScreen: handleModalClose - Closing modal");
    setSelectedMeal(null);
    refreshMeals();
  };

  const renderMealItem = ({ item }) => (
    <MealCard item={item} onPress={handleMealPress} />
  );

  const refreshMeals = async () => {
    if (user) {
      setRefreshing(true);
      await fetchUserMeals();
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <View style={styles.content}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {user && (
            <UserInfoContainer
              phoneNumber={user.number}
              onPhoneNumberSave={handleSavePhoneNumber}
            />
          )}
          {(myMeals?.length || 0) === 0 ? (
            <Text style={styles.noMealsText}>You have no meals</Text>
          ) : (
            <FlatList
              data={myMeals || []}
              renderItem={renderMealItem}
              keyExtractor={(item) => item.$id}
              numColumns={3}
              contentContainerStyle={styles.flatListContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshMeals}
                  colors={["#01766A"]}
                  tintColor="#01766A"
                  title="Pull to refresh..."
                  titleColor="#01766A"
                />
              }
            />
          )}
        </View>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
      </TouchableOpacity>
      {selectedMeal && (
        <Modal
          visible={!!selectedMeal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleModalClose}>
          <MealItem
            meal={selectedMeal}
            onClose={handleModalClose}
            refreshMeals={refreshMeals}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 0.95,
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
  imageLoader: {
    position: "absolute",
    alignSelf: "center",
  },
  logoutButton: {
    backgroundColor: "#b00020",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
});

export default AccountScreen;
