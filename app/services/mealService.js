import databaseService from "./databaseService";
import { ID, Query } from "react-native-appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID;

const mealService = {
  async getMeals(userId) {
    try {
      let queries = [];
      if (userId) {
        queries.push(Query.equal("user_id", userId));
      }

      console.log("getMeals - queries:", queries); // Log the queries

      const response = await databaseService.listDocuments(
        dbId,
        colId,
        queries
      );

      console.log("getMeals - response:", response); // Log the response

      return { data: response, error: null };
    } catch (error) {
      console.error("Error fetching meals:", error); // Log the full error
      return { data: null, error: error.message };
    }
  },

  async addMeal(
    user_id,
    name,
    description,
    imageUris = [],
    tags = [],
    category
  ) {
    console.log("--- ENTERING mealService.addMeal ---");
    console.log("Input Params:", {
      user_id,
      name,
      description,
      imageUris,
      tags,
      category,
    });

    // --- Critical Variable Checks ---
    console.log("Using dbId:", dbId, "| colId:", colId);
    if (!dbId || !colId) {
      console.error(
        "STOPPING: dbId or colId is undefined/empty. Check .env and EXPO_PUBLIC_ prefix!"
      );
      // Throw error to ensure it's caught by the caller's catch block
      throw new Error("Missing Database or Collection ID configuration.");
    }
    if (
      !databaseService ||
      typeof databaseService.createDocument !== "function"
    ) {
      console.error(
        "STOPPING: databaseService or databaseService.createDocument is invalid!"
      );
      throw new Error("Database service is not configured correctly.");
    }
    if (typeof ID?.unique !== "function") {
      console.error("STOPPING: Appwrite ID.unique function is not available!");
      throw new Error("Appwrite ID function missing.");
    }
    // --- End Checks ---

    let data; // Define here to log it even if try block fails early
    try {
      // Construct data object
      data = {
        name: name,
        createdAt: new Date().toISOString(),
        user_id: user_id,
        imageUris: imageUris,
        description: description,
        tags: tags,
        category: category,
      };
      console.log("Constructed data object for Appwrite:", data);

      console.log("Calling databaseService.createDocument...");
      const response = await databaseService.createDocument(
        dbId,
        colId,
        data,
        ID.unique()
      );
      console.log("databaseService.createDocument SUCCEEDED:", response);
      return { data: response, error: null }; // Success path
    } catch (error) {
      // This catches errors specifically FROM databaseService.createDocument
      console.error("!!! CATCH block inside mealService.addMeal reached !!!");
      console.error(
        "Error occurred AFTER data construction, likely during DB call."
      );
      console.error("Data object at time of error:", data); // Log the data that failed
      console.error("Full error details:", error); // Log the actual error from Appwrite/DB service

      // Return the standard error format so the caller can display it
      return {
        data: null,
        error: error.message || "Failed to save meal to database.",
      };
    }
  },

  async updateMeal(id, name, description, imageUris) {
    try {
      const updatedData = {
        name: name,
        description: description,
        imageUris: imageUris,
      };

      const response = await databaseService.updateDocument(
        dbId,
        colId,
        id,
        updatedData
      );
      return { data: response, error: null };
    } catch (error) {
      console.error("Error updating meal:", error);
      return { data: null, error: error.message };
    }
  },

  async deleteMeal(id) {
    console.log("deleteMeal input:", { id });

    if (!id) {
      console.error("Error: Meal ID is missing for delete");
      return { data: null, error: "Meal ID is missing" };
    }

    try {
      await databaseService.deleteDocument(dbId, colId, id);
      console.log("deleteMeal success for ID:", id);
      return { data: { success: true, id: id }, error: null }; // Return success indicator
    } catch (error) {
      console.error("Error deleting meal:", error);
      return { data: null, error: error.message };
    }
  },
};

export default mealService;
