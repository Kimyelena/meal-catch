// MealScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import MealList from "../../components/MealList";
import AddMealModal from "../../components/AddMealModal";
import mealService from "../../services/mealService";

const MealScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    setLoading(true);
    const response = await mealService.getMeals(user?.$id);

    console.log("Fetch meals response:", response);

    if (response.error) {
      setError(response.error);
      Alert.alert("Error", response.error);
    } else {
      setMeals(response.data.data);
      setError(null);
    }

    console.log("Meals state after fetch:", meals);

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
            setMeals(meals.filter((meal) => meal.$id !== id));
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
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.$id === id ? { ...meal, text: response.data.text } : meal
        )
      );
    }
  };

  const addMeal = async (mealName, description, imageUris) => {
    console.log("Adding meal:", { mealName, description, imageUris });

    const response = await mealService.addMeal(
      user?.$id,
      mealName,
      description,
      imageUris
    );

    console.log("Database response:", response);

    if (response?.error) {
      Alert.alert("Error", response.error);
    } else {
      fetchMeals();
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {meals.length === 0 ? (
            <Text style={styles.noMealsText}>You have no meals</Text>
          ) : (
            <MealList meals={meals} onDelete={deleteMeal} onEdit={editMeal} />
          )}
        </>
      )}

      {modalVisible && (
        <AddMealModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          addMeal={addMeal}
        />
      )}

      <TouchableOpacity
        style={styles.openModalButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.openModalButtonText}>+</Text>
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
  openModalButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  openModalButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default MealScreen;
