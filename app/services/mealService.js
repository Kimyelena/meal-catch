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
    user_id, // This parameter is being passed from AddMealModal, but mealService.addMeal expects it directly
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

    let uploadedImageUrls = [];
    try {
      if (imageUris && imageUris.length > 0) {
        console.log(`Attempting to upload ${imageUris.length} images...`);

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
      // We will re-throw this error so MealListScreen can catch it
      // If you want to proceed with meal creation even if image upload fails,
      // you can remove this throw, but then handle `uploadedImageUrls` being empty.
      // For now, it's safer to fail early if images are mandatory.
      throw new Error(
        `Failed to upload images: ${imageError.message || imageError}`
      );
    }

    console.log("Final uploadedImageUrls:", uploadedImageUrls);

    try {
      const mealData = {
        name,
        createdAt: new Date().toISOString(),
        user_id,
        imageUris: uploadedImageUrls,
        description,
        tags,
        category,
      };

      console.log("Final meal data structure:", JSON.stringify(mealData));

      const response = await databaseService.createDocument(
        dbId,
        colId,
        mealData,
        ID.unique() // ID should come before data object for Appwrite SDK
      );

      console.log("Meal created successfully with ID:", response.$id);
      // --- IMPORTANT CHANGE HERE ---
      // Return the raw response object directly for optimistic UI update
      return response;
    } catch (error) {
      console.error("Error creating meal document:", error);
      // --- IMPORTANT CHANGE HERE ---
      // Throw the error so it can be caught by handleAddMeal in MealListScreen
      throw error;
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
