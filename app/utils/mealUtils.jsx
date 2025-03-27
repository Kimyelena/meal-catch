import mealService from "../services/mealService";
import { Alert } from "react-native";

export const fetchMeals = async (
  userId,
  setMeals,
  setLoading = true,
  setError,
  isUserSpecific = false
) => {
  console.log("fetchMeals - start", { userId, isUserSpecific }); // Log input

  setLoading(true);
  try {
    let response;
    if (isUserSpecific && userId) {
      console.log("fetchMeals - calling getMealsByUser", userId);
      response = await mealService.getMeals(userId);
      console.log("fetchMeals - getMealsByUser response:", response); // Log response
    } else {
      console.log("fetchMeals - calling getMeals");
      response = await mealService.getMeals();
      console.log("fetchMeals - getMeals response:", response); // Log response
    }

    if (response.error) {
      console.error("fetchMeals - mealService error:", response.error);
      setError(response.error);
      Alert.alert("Error", response.error);
    } else {
      const fetchedMeals = response.data.data;
      console.log("fetchMeals - fetchedMeals:", fetchedMeals);
      setMeals(fetchedMeals);
      setError(null);
    }
  } catch (error) {
    console.error("fetchMeals - error:", error);
    setError("Failed to fetch meals.");
    Alert.alert("Error", "Failed to fetch meals.");
  }
  setLoading(false);
  console.log("fetchMeals - end"); // Log end
};
