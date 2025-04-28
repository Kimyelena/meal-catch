import React from "react";
import { View, Text } from "react-native";
import mealService from "../services/mealService";
import { Alert } from "react-native";

// Format date for meal display
export const formatMealDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Get meal category label
export const getCategoryLabel = (category) => {
  const categories = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    dessert: "Dessert",
    other: "Other",
  };

  return categories[category?.toLowerCase()] || "Other";
};

// Render meal category badge
export const CategoryBadge = ({ category }) => {
  return (
    <View
      style={{
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
      }}>
      <Text style={{ color: "#333", fontSize: 12 }}>
        {getCategoryLabel(category)}
      </Text>
    </View>
  );
};

// Validate that a meal has an image before adding
export const validateMealImage = (image) => {
  if (!image) {
    Alert.alert("Validation Error", "A meal image is required.");
    return false;
  }
  return true;
};

// Bundle functions and components into a default export
const mealUtils = {
  formatMealDate,
  getCategoryLabel,
  CategoryBadge,
};

export default mealUtils;

export const fetchMeals = async (
  userId,
  setMeals,
  setLoading = true,
  setError = () => {}, // Default to no-op function
  isUserSpecific = false
) => {
  console.log("fetchMeals - start", { userId, isUserSpecific });

  setLoading(true);
  try {
    let response;
    if (isUserSpecific && userId) {
      console.log("fetchMeals - calling getMealsByUser", userId);
      response = await mealService.getMeals(userId);
      console.log("fetchMeals - getMealsByUser response:", response);
    } else {
      console.log("fetchMeals - calling getMeals");
      response = await mealService.getMeals();
      console.log("fetchMeals - getMeals response from mealUtils:", response);
    }

    if (response.error) {
      console.error("fetchMeals - mealService error:", response.error);
      setError(response.error);
      Alert.alert("Error", response.error);
      // Always set meals to empty array on error
      setMeals([]);
    } else {
      const fetchedMeals = response.data.documents || [];
      console.log("fetchMeals - fetchedMeals:", fetchedMeals);
      setMeals(fetchedMeals);
      setError(null);
    }
  } catch (error) {
    console.error("fetchMeals - error:", error);
    setError("Failed to fetch meals.");
    Alert.alert("Error", "Failed to fetch meals.");
    // Always set meals to empty array on exception
    setMeals([]);
  }
  setLoading(false);
  console.log("fetchMeals - end");
};
