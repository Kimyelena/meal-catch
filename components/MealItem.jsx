const MealItem = ({ meal, onClose, refreshMeals, onMealAdded }) => {
  const handleAddMeal = async () => {
    try {
      console.log("Adding meal...");
      // Logic to add the meal
      const response = await mealService.addMeal(meal); // Replace with actual service call
      if (response.success) {
        console.log("Meal added successfully");
        if (onMealAdded) {
          onMealAdded(); // Notify parent to refresh meals
        }
        if (onClose) {
          onClose(); // Close the modal
        }
      } else {
        console.error("Failed to add meal:", response.error);
      }
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  return (
    <View>
      {/* ...existing code... */}
      <TouchableOpacity onPress={handleAddMeal}>
        <Text>Add Meal</Text>
      </TouchableOpacity>
      {/* ...existing code... */}
    </View>
  );
};
