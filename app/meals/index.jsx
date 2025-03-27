import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import MealItemView from "../components/MealItemView";
import { fetchMeals } from "../utils/mealUtils"; // Import the utility function
import AddMealModal from "../components/AddMealModal";
import mealService from "../services/mealService";

const MealListScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchMeals(null, setMeals, setLoading, setError);
      console.log("MealListScreen - meals state:", meals); // LOG
    }
  }, [user]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <ScrollView>
            {categories.map((category) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <ScrollView horizontal={true}>
                  {meals
                    .filter((meal) => meal.category === category)
                    .map((meal) => (
                      <MealItemView key={meal.$id} meal={meal} />
                    ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          <AddMealModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            addMeal={mealService.createMeal}
          />
        </>
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  // Add styles as needed
});

export default MealListScreen;
