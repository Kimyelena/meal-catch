import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import MealList from "../components/MealList";
import AddMealModal from "../components/AddMealModal";
import mealService from "../services/mealService";

const MealScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMeal, setNewMeal] = useState("");
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

    if (response.error) {
      setError(response.error);
      Alert.alert("Error", response.error);
    } else {
      setMeals(response.data);
      setError(null);
    }

    setLoading(false);
  };

  const AddMeal = async () => {
    if (newMeal.trim() === "") {
      Alert.alert("Error", "Meal name cannot be empty");
      return;
    }

    const response = await mealService.addMeal(user.$id, newMeal);

    if (response.error) {
      Alert.alert("Error", response.error);
    } else {
      setMeals([...meals, response.data]);
    }

    setNewMeal("");
    setModalVisible(false);
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModalVisible(true);
        }}>
        <Text style={styles.addButtonText}>+ Add Meal</Text>
      </TouchableOpacity>

      {modalVisible && (
        <AddMealModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          newMeal={newMeal}
          setNewMeal={setNewMeal}
          AddMeal={AddMeal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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

export default MealScreen;
