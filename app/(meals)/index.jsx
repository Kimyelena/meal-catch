import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { fetchMeals } from "../utils/mealUtils";
import AddMealModal from "../components/AddMealModal";
import mealService from "../services/mealService";
import MealItemView from "../components/MealItemView";

const MealListScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/(auth)");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchMeals(user?.$id, setMeals, setLoading, setError);
    }
  }, [user]);

  useEffect(() => {
    if (meals && meals.length > 0) {
      const uniqueCategories = [...new Set(meals.map((meal) => meal.category))];
      setCategories(uniqueCategories);
    }
  }, [meals]);

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
  };

  const handleModalClose = () => {
    setSelectedMeal(null);
    refreshMeals();
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      key={item.$id}
      onPress={() => handleMealPress(item)}
      style={styles.mealCard}>
      <Image
        source={
          item.imageUris[0]
            ? { uri: item.imageUris[0] }
            : require("../../assets/placeholder.png") // Fallback placeholder
        }
        style={styles.mealImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const refreshMeals = useCallback(async () => {
    if (!user) return;

    setRefreshing(true);

    try {
      await new Promise((resolve) => {
        fetchMeals(
          user.$id,
          (newMeals) => {
            setMeals(newMeals);
            resolve();
          },
          (newError) => {
            setError(newError);
            resolve();
          }
        );
      });
    } catch (err) {
      setError("Failed to refresh meals: " + err.message);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshMeals}
                colors={["#01766A"]}
                tintColor="#01766A"
                title="Pulling to refresh..."
                titleColor="#01766A"
              />
            }>
            {categories.length > 0 ? (
              categories.map((category) => (
                <View key={category} style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <ScrollView horizontal={true}>
                    {meals
                      .filter((meal) => meal.category === category)
                      .map((meal) => renderMealItem({ item: meal }))}
                  </ScrollView>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No meals available</Text>
                {refreshing && (
                  <ActivityIndicator
                    size="small"
                    color="#01766A"
                    style={styles.inlineLoader}
                  />
                )}
              </View>
            )}
          </ScrollView>
          <AddMealModal
            modalVisible={addMealModalVisible}
            setModalVisible={setAddMealModalVisible}
            addMeal={mealService.addMeal}
          />
          {selectedMeal && (
            <MealItemView
              meal={selectedMeal}
              onClose={handleModalClose}
              visible={!!selectedMeal}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 10,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealCard: {
    width: 155,
    height: 155,
    marginRight: 5,
    borderRadius: 5,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
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
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalCloseText: {
    color: "white",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  inlineLoader: {
    marginTop: 10,
  },
});

export default MealListScreen;
