import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import MealList from "../components/MealList";
import mealService from "../services/mealService";
import { Alert, ActivityIndicator } from "react-native";

const AccountScreen = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const [myMeals, setMyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyMeals();
    }
  }, [user]);

  const fetchMyMeals = async () => {
    setLoading(true);
    const response = await mealService.getMeals(user?.$id);

    if (response.error) {
      setError(response.error);
      Alert.alert("Error", response.error);
    } else {
      setMyMeals(response.data.data);
      setError(null);
    }

    setLoading(false);
  };

  const deleteMeal = async (id) => {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const response = await mealService.deleteMeal(id);
          if (response.error) {
            Alert.alert("Error", response.error);
          } else {
            fetchMyMeals();
          }
        },
      },
    ]);
  };

  const editMeal = async (id, newText) => {
    if (!newText.trim()) {
      Alert.alert("Error", "Meal text cannot be empty");
      return;
    }

    const response = await mealService.updateMeal(id, newText);

    if (response.error) {
      Alert.alert("Error", response.error);
    } else {
      fetchMyMeals();
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {myMeals.length === 0 ? (
            <Text style={styles.noMealsText}>You have no meals</Text>
          ) : (
            <MealList meals={myMeals} onDelete={deleteMeal} onEdit={editMeal} />
          )}
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
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
});

export default AccountScreen;
