import databaseService from "./databaseService";
import { ID, Query } from "react-native-appwrite";
import imageService from "./imageService";
import { config } from "./appwrite";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID;

const mealService = {
  async getMeals() {
    try {
      console.log("getAllMeals - fetching all meals");

      const response = await databaseService.listDocuments(dbId, colId, []);

      console.log("getAllMeals - response:", response);

      return { data: response, error: null };
    } catch (error) {
      console.error("Error fetching all meals:", error);
      return { data: null, error: error.message };
    }
  },

  async getUsersMeals(userId) {
    try {
      console.log("getUsersMeals - fetching meals for user:", userId);

      const response = await databaseService.listDocuments(dbId, colId, [
        Query.equal("user_id", userId),
      ]);

      console.log("getUsersMeals - response:", response);

      return { data: response, error: null };
    } catch (error) {
      console.error("Error fetching user's meals:", error);
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
    console.log("Using dbId:", dbId, "| colId:", colId);
    if (!dbId || !colId) {
      console.error(
        "dbId or colId is undefined/empty. Check .env and EXPO_PUBLIC_ prefix!"
      );
      throw new Error("Missing Database or Collection ID configuration.");
    }
    if (
      !databaseService ||
      typeof databaseService.createDocument !== "function"
    ) {
      console.error(
        "databaseService or databaseService.createDocument is invalid!"
      );
      throw new Error("Database service is not configured correctly.");
    }
    if (typeof ID?.unique !== "function") {
      console.error("Appwrite ID.unique function is not available!");
      throw new Error("Appwrite ID function missing.");
    }
    // --- End Checks ---

    let data;
    try {
      // 1. Upload Images and Get URLs
      const uploadedImageUrls = [];
      for (const uri of imageUris) {
        const imageUrl = await imageService.uploadImagesAndGetUrls(
          uri,
          config.bucketId
        );
        if (imageUrl) {
          uploadedImageUrls.push(imageUrl);
        }
      }

      data = {
        name: name,
        createdAt: new Date().toISOString(),
        user_id: user_id,
        imageUris: uploadedImageUrls, // Use uploaded URLs
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
      return { data: response, error: null };
    } catch (error) {
      console.error("!!! CATCH block inside mealService.addMeal reached !!!");
      console.error(
        "Error occurred AFTER data construction, likely during DB call."
      );
      console.error("Data object at time of error:", data);
      console.error("Full error details:", error);
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
      return { data: { success: true, id: id }, error: null };
    } catch (error) {
      console.error("Error deleting meal:", error);
      return { data: null, error: error.message };
    }
  },
};

export default mealService;
