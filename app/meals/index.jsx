import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import MealItem from "../components/MealItem";
import mealService from "../services/mealService";

const MealListScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([
    "Home made",
    "Trvanlive",
    "Sweets",
    "Others",
    // Add all your categories here
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchAllMeals();
    }
  }, [user]);

  const fetchAllMeals = async () => {
    setLoading(true);
    try {
      const response = await mealService.getMeals();

      if (response.error) {
        setError(response.error);
        Alert.alert("Error", response.error);
      } else {
        setMeals(response.data.data);
        setError(null);
      }
    } catch (error) {
      setError("Failed to fetch meals.");
      Alert.alert("Error", "Failed to fetch meals.");
    }
    setLoading(false);
  };

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
                {meals
                  .filter((meal) => meal.category === category)
                  .map((meal) => (
                    <MealItem key={meal.$id} meal={meal} />
                  ))}
              </View>
            ))}
          </ScrollView>
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
