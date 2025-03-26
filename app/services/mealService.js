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

      const response = await databaseService.listDocuments(
        dbId,
        colId,
        queries
      );
      return { data: response, error: null };
    } catch (error) {
      console.error("Error fetching meals:", error);
      return { data: null, error: error.message };
    }
  },

  async addMeal(
    user_id,
    name,
    description,
    imageUris = [],
    tags = [],
    category = []
  ) {
    console.log("--- ENTERING mealService.addMeal ---"); // Log function entry
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
        imageUris: imageUris, // Ensure Appwrite attribute type is String Array
        description: description, // Ensure key matches Appwrite attribute
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

  // --- REFACTORED updateMeal FUNCTION ---
  /**
   * Updates specific fields of a meal document.
   * @param {string} id - The ID of the meal document to update.
   * @param {object} updatedData - An object containing the fields to update.
   * Keys MUST match Appwrite attribute keys.
   * Example: { text: "New Name", description: "New Desc", imageUris: ["uri1", "uri3"] }
   */
  async updateMeal(id, updatedData) {
    console.log("updateMeal input:", { id, updatedData });

    if (!id) {
      console.error("Error: Meal ID is missing for update");
      return { data: null, error: "Meal ID is missing" };
    }

    if (
      !updatedData ||
      typeof updatedData !== "object" ||
      Object.keys(updatedData).length === 0
    ) {
      console.error("Error: Invalid or empty update data provided");
      return { data: null, error: "Invalid or empty update data provided" };
    }

    // --- Important: Construct the payload for Appwrite ---
    // Ensure the keys here EXACTLY match your Appwrite Collection Attribute keys.
    const dataForAppwrite = {};

    if (updatedData.text !== undefined) {
      // Use 'text' key matching Appwrite attribute
      dataForAppwrite.text = updatedData.text;
    }
    if (updatedData.description !== undefined) {
      // Use 'description' or 'descriptions' key matching Appwrite attribute
      dataForAppwrite.description = updatedData.description;
      // OR dataForAppwrite.descriptions = updatedData.description;
    }
    if (updatedData.imageUris !== undefined) {
      // Use 'imageUris' key matching Appwrite attribute
      // This will REPLACE the existing array in Appwrite with the new one.
      dataForAppwrite.imageUris = updatedData.imageUris;
    }
    // Add other fields if they need updating (e.g., tags)
    // if (updatedData.tags !== undefined) {
    //     dataForAppwrite.tags = updatedData.tags;
    // }

    // Add a timestamp for the update if you have an 'updatedAt' field
    // dataForAppwrite.updatedAt = new Date().toISOString();

    // Check if there's anything to update after filtering
    if (Object.keys(dataForAppwrite).length === 0) {
      console.warn(
        "updateMeal: No valid fields provided for update after filtering."
      );
      // You might return the original data or a specific message
      return { data: null, error: "No valid fields provided for update." };
    }

    console.log("Data being sent to Appwrite for update:", dataForAppwrite);

    try {
      // Pass the constructed data object containing only the fields to update
      const response = await databaseService.updateDocument(
        dbId,
        colId,
        id,
        dataForAppwrite
      );
      console.log("updateMeal response:", response);
      return { data: response, error: null };
    } catch (error) {
      console.error("Error updating meal:", error);
      return { data: null, error: error.message };
    }
  },
  // --- END OF REFACTORED updateMeal ---

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
