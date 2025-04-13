import mealService from "../services/mealService";
import { Alert } from "react-native";

export const fetchMeals = async (
  userId,
  setMeals,
  setLoading = true,
  setError,
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
