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

      console.log("this is getAllMeals from mealService - response:", response);

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

    // Process images - fix the data handling
    let uploadedImageUrls = [];
    try {
      if (imageUris && imageUris.length > 0) {
        console.log(`Attempting to upload ${imageUris.length} images...`);

        // Direct call to imageService
        const uploadResults = await imageService.uploadImagesAndGetUrls(
          imageUris
        );
        console.log(
          "Direct uploadResults received:",
          Array.isArray(uploadResults)
            ? JSON.stringify(uploadResults)
            : uploadResults
        );

        if (Array.isArray(uploadResults)) {
          // Accept any non-empty string URLs
          uploadedImageUrls = uploadResults
            .map((url) => String(url))
            .filter((url) => url && url.length > 0 && url.includes("://"));

          console.log(
            `Filtered ${uploadResults.length} results to ${uploadedImageUrls.length} URLs`
          );
        } else {
          console.warn("Upload results is not an array:", uploadResults);
        }
      } else {
        console.log("No images to upload");
      }
    } catch (imageError) {
      console.error("Error uploading images:", imageError);
      // Continue with meal creation with empty image array
    }

    console.log("Final uploadedImageUrls:", uploadedImageUrls);

    try {
      const mealData = {
        name,
        createdAt: new Date().toISOString(),
        user_id,
        imageUris: uploadedImageUrls, // This should now have the URLs or be empty
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

      console.log("Meal created successfully with ID:", response.$id);
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

  async updateMeal(id, name, description, imageUris, tags = []) {
    try {
      // Input validation
      if (!name || name.trim() === "") {
        return { error: "Meal name is required" };
      }

      // Prepare update data
      const updateData = {
        name,
        description: description || "",
        imageUris,
        tags, // Include tags in the update
        // updated_at: new Date().toISOString(),
      };

      // Update the meal document
      const response = await databaseService.updateDocument(
        dbId,
        colId,
        id,
        updateData
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
