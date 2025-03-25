import databaseService from "./databaseService";
import { ID, Query } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID;

const mealService = {
  async getMeals(userId) {
    if (!userId) {
      console.error("Error: Missing userId in getMeals()");
      return {
        data: [],
        error: "User ID is missing",
      };
    }

    try {
      const response = await databaseService.listDocuments(dbId, colId, [
        Query.equal("user_id", userId),
      ]);
      return response;
    } catch (error) {
      console.log("Error fetching meal:", error.message);
      return { data: [], error: error.message };
    }
  },

  async addMeal(user_id, text, imageUris = []) {
    if (!text) {
      return { error: "Meal text cannot be empty" };
    }

    // Ensure the image URIs are provided or empty
    const images = imageUris.length > 0 ? imageUris : [];

    const data = {
      text: text,
      createdAt: new Date().toISOString(),
      user_id: user_id,
      imageUris: imageUris, // Store the image URLs in the database
    };

    const response = await databaseService.createDocument(
      dbId,
      colId,
      data,
      ID.unique()
    );

    if (response?.error) {
      return { error: response.error };
    }

    return { data: response };
  },

  async updateMeal(id, text) {
    const response = await databaseService.updateDocument(dbId, colId, id, {
      text,
    });

    if (response?.error) {
      return { error: response.error };
    }

    return { data: response };
  },

  async deleteMeal(id) {
    const response = await databaseService.deleteDocument(dbId, colId, id);
    if (response?.error) {
      return { error: response.error };
    }

    return { success: true };
  },
};

export default mealService;
