import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { fetchMeals } from "../utils/mealUtils";
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
      setLoading(true);
      fetchMeals(user?.$id, setMeals, setLoading, setError);
    }
  }, [user]);

  // useEffect to extract categories from meals
  useEffect(() => {
    if (meals && meals.length > 0) {
      const uniqueCategories = [...new Set(meals.map((meal) => meal.category))];
      setCategories(uniqueCategories);
    }
  }, [meals]);

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
                      <TouchableOpacity
                        key={meal.$id}
                        onPress={() => router.push(`/meal/${meal.$id}`)}
                        style={styles.mealCard}>
                        <Image
                          source={{ uri: meal.imageUris[0] }}
                          style={styles.mealImage}
                        />
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          <AddMealModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            addMeal={mealService.addMeal}
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
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealCard: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  // Add other styles as needed
});

export default MealListScreen;
