import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker from Expo
import { Ionicons } from "react-native-vector-icons"; // Import Ionicons for close button icon

const AddMealModal = ({ modalVisible, setModalVisible, addMeal }) => {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);

  // Function to request permissions
  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (mediaLibraryStatus !== "granted" || cameraStatus !== "granted") {
      alert(
        "Sorry, we need camera and photo library permissions to make this work!"
      );
    }
  };

  // Function to open the camera
  const openCamera = async () => {
    await requestPermissions(); // Request permissions before opening the camera

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaType: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.cancelled) {
        setImageUris((prevUris) => [...prevUris, result.uri]);
      }
    } catch (error) {
      console.log("Error opening camera:", error);
      alert("There was an issue opening the camera.");
    }
  };

  // Function to open the gallery
  const openGallery = async () => {
    await requestPermissions(); // Request permissions before opening the gallery

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true, // Allow multiple image selection
      });

      if (!result.cancelled) {
        setImageUris((prevUris) => [...prevUris, ...result.selected]);
      }
    } catch (error) {
      console.log("Error opening gallery:", error);
      alert("There was an issue opening the gallery.");
    }
  };

  // Function to prompt user for selecting photo source
  const handlePhotoSelection = () => {
    Alert.alert(
      "Select Photo Option",
      "Choose to either take a photo or select from the gallery.",
      [
        {
          text: "Take Photo",
          onPress: openCamera,
        },
        {
          text: "Choose from Gallery",
          onPress: openGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Handle adding a new meal
  const handleAddMeal = () => {
    if (!mealName.trim()) {
      alert("Meal name cannot be empty");
      return;
    }

    addMeal(mealName, description, imageUris);
    setMealName("");
    setDescription("");
    setImageUris([]);
    setModalVisible(false); // Close the modal after adding the meal
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Meal</Text>

          {/* Close Button (X Icon) positioned top-right */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)} // Close modal on click
          >
            <Ionicons name="close" size={30} color="#D3D3D3" />{" "}
            {/* Set the color here */}
          </TouchableOpacity>

          {/* Photo Frame */}
          <TouchableOpacity
            style={styles.photoFrame}
            onPress={handlePhotoSelection} // Trigger photo selection
          >
            <Text style={styles.photoFrameText}>
              {imageUris.length === 0 ? "Add Photos" : "Change Photos"}
            </Text>
          </TouchableOpacity>

          {/* Meal Name */}
          <TextInput
            style={styles.input}
            placeholder="Enter meal name"
            value={mealName}
            onChangeText={setMealName}
          />

          {/* Meal Description */}
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter meal description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Image Preview */}
          <View style={styles.imagePreviewContainer}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
            <Text style={styles.addButtonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Modal background with opacity
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    position: "relative", // Relative positioning to place the close button in top-right
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100, // Makes the description input taller
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    color: "#D3D3D3",
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the close button appears above other content
  },
  photoFrame: {
    width: 255,
    height: 300,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  photoFrameText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 8,
  },
});

export default AddMealModal;
