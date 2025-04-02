import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import mealService from "../services/mealService";
import * as ImagePicker from "expo-image-picker";

const MealItem = ({ meal, onClose, refreshMeals }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(meal.name);
  const [editedDescription, setEditedDescription] = useState(meal.description);
  const [editedImageUris, setEditedImageUris] = useState(meal.imageUris);

  const handleSave = async () => {
    try {
      const response = await mealService.updateMeal(
        meal.$id,
        editedName,
        editedDescription,
        editedImageUris
      );
      console.log("Update response:", response);

      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setIsEditing(false);
        onClose(); // Close the modal in AccountScreen
        refreshMeals();
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update meal.");
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setEditedImageUris((prevUris) =>
      prevUris.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleDeleteMeal = async () => {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await mealService.deleteMeal(meal.$id);
            if (response.error) {
              Alert.alert("Error", response.error);
            } else {
              onClose(); // Close the modal in AccountScreen
              refreshMeals();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete meal.");
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setEditedImageUris((prevUris) => [...prevUris, ...selectedUris]);
    }
  };

  return (
    <View style={styles.modalContent}>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={editedName}
          onChangeText={setEditedName}
          autoFocus
          onSubmitEditing={handleSave}
          returnKeyType="done"
        />
      ) : (
        <Text style={styles.modalTitle}>{editedName}</Text>
      )}

      <ScrollView horizontal={true}>
        {editedImageUris &&
          editedImageUris.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.detailImage} />
              {isEditing && (
                <TouchableOpacity
                  onPress={() => handleDeleteImage(index)}
                  style={styles.deleteButton}></TouchableOpacity>
              )}
            </View>
          ))}
      </ScrollView>

      {isEditing && <Button title="Add Image" onPress={pickImage} />}

      {isEditing ? (
        <TextInput
          style={styles.descriptionInput}
          value={editedDescription}
          onChangeText={setEditedDescription}
          multiline
          numberOfLines={4}
          onSubmitEditing={handleSave}
          returnKeyType="done"
        />
      ) : (
        <Text style={styles.modalDescription}>{editedDescription}</Text>
      )}

      <View style={styles.modalActions}>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave}>
            <Icon name="check" size={24} color="green" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Icon name="edit" size={24} color="gray" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleDeleteMeal}>
          <Icon name="delete" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <Text style={styles.hintText}>All items will be removed in 3 days.</Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose} // Use onClose to close modal
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  mealItem: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 10,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  deleteButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    color: "gray",
    marginTop: 10,
  },
});

export default MealItem;
