// meal detailes, only for user who currently used app
import React, { useState, useRef } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import mealService from "../services/mealService"; // Import mealService
import { fetchMeals } from "../utils/mealUtils"; // Import fetchMeals

const MealItem = ({ meal, refreshMeals }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(meal.name);
  const [editedDescription, setEditedDescription] = useState(meal.description);
  const [editedImageUris, setEditedImageUris] = useState(meal.imageUris);
  const inputRefName = useRef(null);
  const inputRefDescription = useRef(null);

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Meal name cannot be empty");
      return;
    }

    try {
      const response = await mealService.updateMeal(
        meal.$id,
        editedName,
        editedDescription,
        editedImageUris
      );
      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setIsEditing(false);
        setModalVisible(false);
        refreshMeals();
      }
    } catch (error) {
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
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await mealService.deleteMeal(meal.$id);
            if (response.error) {
              Alert.alert("Error", response.error);
            } else {
              setModalVisible(false);
              refreshMeals(fetchMeals);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete meal.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.mealItem}>
          {meal.imageUris && meal.imageUris.length > 0 && (
            <Image
              source={{ uri: meal.imageUris[0] }}
              style={styles.mealImage}
            />
          )}
          <Text style={styles.mealName}>{meal.name}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isEditing ? (
              <TextInput
                ref={inputRefName}
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
                        style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>X</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </ScrollView>

            {isEditing ? (
              <TextInput
                ref={inputRefDescription}
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
                {" "}
                {/* Call handleDeleteMeal */}
                <Icon name="delete" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>
              All items will be removed in 3 days.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // New container to wrap the TouchableOpacity and Modal
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  mealName: {
    fontSize: 18,
    flex: 1,
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
    flex: 1,
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
  deleteButtonText: {
    color: "white",
    fontSize: 12,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 10,
  },
  descriptionInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 12,
    color: "gray",
    marginTop: 10,
    textAlign: "center",
  },
});

export default MealItem;
