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
      imageUris: Array.isArray(imageUris)
        ? `${imageUris.length} images`
        : imageUris,
      tags,
      category,
    });

    if (!dbId || !colId) {
      console.error("dbId or colId is undefined/empty");
      throw new Error("Missing Database or Collection ID configuration.");
    }

    // Process images first - even if this fails, we'll still try to create the meal
    let uploadedImageUrls = [];
    try {
      if (imageUris && imageUris.length > 0) {
        // We'll process all images at once in the imageService
        const urls = await imageService.uploadImagesAndGetUrls(imageUris);

        if (Array.isArray(urls)) {
          // Filter to ensure we only have strings
          uploadedImageUrls = urls.filter((url) => typeof url === "string");
          console.log("Image upload successful, got URLs:", uploadedImageUrls);
        }
      }
    } catch (imageError) {
      console.error("Error uploading images:", imageError);
      // Continue with meal creation, but with empty image URLs
    }

    try {
      const mealData = {
        name,
        createdAt: new Date().toISOString(),
        user_id,
        imageUris: uploadedImageUrls, // This will be a simple array of strings
        description,
        tags,
        category,
      };

      console.log("Final meal data structure:", JSON.stringify(mealData));

      const response = await databaseService.createDocument(
        dbId,
        colId,
        mealData,
        ID.unique()
      );

      console.log("Meal created successfully:", response.$id);
      return {
        data: response,
        error: null,
        imageUploadStatus: uploadedImageUrls.length > 0 ? "success" : "failed",
      };
    } catch (error) {
      console.error("Error creating meal document:", error);
      return {
        data: null,
        error: error.message || "Failed to save meal to database",
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
