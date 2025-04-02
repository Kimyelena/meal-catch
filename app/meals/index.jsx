import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { fetchMeals } from "../utils/mealUtils";
import AddMealModal from "../components/AddMealModal";
import mealService from "../services/mealService";
import MealItemView from "../components/MealItemView";

const MealListScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const [mealDetailsModalVisible, setMealDetailsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

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

  useEffect(() => {
    if (meals && meals.length > 0) {
      const uniqueCategories = [...new Set(meals.map((meal) => meal.category))];
      setCategories(uniqueCategories);
    }
  }, [meals]);

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setMealDetailsModalVisible(true);
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      key={item.$id}
      onPress={() => handleMealPress(item)}
      style={styles.mealCard}>
      <Image source={{ uri: item.imageUris[0] }} style={styles.mealImage} />
    </TouchableOpacity>
  );

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
                    .map((meal) => renderMealItem({ item: meal }))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          <AddMealModal
            modalVisible={addMealModalVisible}
            setModalVisible={setAddMealModalVisible}
            addMeal={mealService.addMeal}
          />
          {/* Meal Details Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={mealDetailsModalVisible}
            onRequestClose={() => setMealDetailsModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedMeal && <MealItemView meal={selectedMeal} />}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setMealDetailsModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealCard: {
    width: 150,
    height: 150,
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
  },
});

export default MealListScreen;
