import databaseService from "./databaseService";
import { ID, Query } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID;

const mealService = {
  async getMeals(userId) {
    if (!userId) {
      console.error("Error: Missing userId in getMeals()");
      return { data: null, error: "User ID is missing" };
    }

    try {
      const response = await databaseService.listDocuments(dbId, colId, [
        Query.equal("user_id", userId),
      ]);
      return { data: response, error: null };
    } catch (error) {
      console.error("Error fetching meal:", error.message);
      return { data: null, error: error.message };
    }
  },

  async addMeal(user_id, text, description, imageUris = []) {
    //Added description parameter
    if (!text) {
      return { data: null, error: "Meal text cannot be empty" };
    }

    if (!Array.isArray(imageUris)) {
      return { data: null, error: "imageUris must be an array" };
    }

    const data = {
      text: text,
      createdAt: new Date().toISOString(),
      user_id: user_id,
      imageUris: imageUris,
      description: description, //added description to data.
    };

    console.log("mealService.addMeal data:", data); // Log data

    try {
      const response = await databaseService.createDocument(
        dbId,
        colId,
        data,
        ID.unique()
      );

      console.log("mealService.addMeal response:", response); // Log response

      return { data: response, error: null };
    } catch (error) {
      console.error("Error adding meal:", error.message);
      return { data: null, error: error.message };
    }
  },

  async updateMeal(id, text) {
    if (!id) {
      return { data: null, error: "Meal ID is missing" };
    }

    try {
      const response = await databaseService.updateDocument(dbId, colId, id, {
        text,
      });
      return { data: response, error: null };
    } catch (error) {
      console.error("Error updating meal:", error.message);
      return { data: null, error: error.message };
    }
  },

  async deleteMeal(id) {
    if (!id) {
      return { data: null, error: "Meal ID is missing" };
    }

    try {
      await databaseService.deleteDocument(dbId, colId, id);
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error("Error deleting meal:", error.message);
      return { data: null, error: error.message };
    }
  },
};

export default mealService;
