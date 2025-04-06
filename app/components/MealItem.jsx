import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import mealService from "../services/mealService";
import * as ImagePicker from "expo-image-picker";

const { height } = Dimensions.get("window");

const MealItem = ({ meal, onClose, refreshMeals }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(meal.name);
  const [editedDescription, setEditedDescription] = useState(meal.description);
  const [editedImageUris, setEditedImageUris] = useState(meal.imageUris);
  const modalAnimation = useRef(new Animated.Value(0)).current; // Start at 0 height
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(modalAnimation, {
        toValue: height * 0.65,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        modalAnimation.setValue(height);
        // ADDED DELAY:
        setTimeout(() => {
          onClose(); // Call onClose after a delay
        }, 1); // Adjust delay as needed (milliseconds)
      });
    }
  }, [modalVisible]);

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
        setModalVisible(false);
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
              setModalVisible(false);
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
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { height: modalAnimation }]}>
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mealName: {
    fontSize: 18,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  detailImage: {
    width: 250,
    height: 250,
    borderRadius: 5,
  },
  modalDescription: {
    marginTop: 10,
    marginBottom: 10,
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
    right: 15,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 10,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 5,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default MealItem;
