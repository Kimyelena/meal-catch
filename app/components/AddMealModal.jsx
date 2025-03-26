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
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Tags from "react-native-tags";

const Tag = ({ tag, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.tag, selected && styles.selectedTag]}
    onPress={onPress}>
    <Text style={styles.tagText}>{tag}</Text>
  </TouchableOpacity>
);

const AddMealModal = ({ modalVisible, setModalVisible, addMeal }) => {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Fast food",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Homemade",
    "Restaurant",
    "Fresh",
    "Leftover",
    "Remaining",
    "No additives",
    "Low-calorie",
    "Local",
    "Seasonal",
    "Healthy",
    "Sugar",
    "Sugar-free",
    "Sweet",
    "Long-lasting",
  ];

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

  const openCamera = async () => {
    await requestPermissions();

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setImageUris((prevUris) => [...prevUris, result.uri]);
      }
    } catch (error) {
      console.log("Error opening camera:", error);
      alert("There was an issue opening the camera.");
    }
  };

  const openGallery = async () => {
    await requestPermissions();

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const urisArray = result.assets.map((asset) => asset.uri);
        setImageUris((prevUris) => [...prevUris, ...urisArray]);
      }
    } catch (error) {
      console.error("Gallery Error:", error);
      alert("There was an issue opening the gallery.");
    }
  };

  const handlePhotoSelection = () => {
    Alert.alert(
      "Select Photo Option",
      "Choose to either take a photo or select from the gallery.",
      [
        { text: "Take Photo", onPress: openCamera },
        { text: "Choose from Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleAddMeal = () => {
    if (!mealName || !mealName.trim()) {
      alert("Meal name cannot be empty");
      return;
    }

    addMeal(mealName, description, imageUris, selectedTags);
    setMealName("");
    setDescription("");
    setImageUris([]);
    setSelectedTags([]);
    setModalVisible(false);
  };

  const handleToggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleDeleteImage = (indexToDelete) => {
    setImageUris((prevUris) =>
      prevUris.filter((_, index) => index !== indexToDelete)
    );
  };

  useEffect(() => {
    if (!modalVisible) {
      setMealName("");
      setDescription("");
      setImageUris([]);
      setSelectedTags([]);
    }
  }, [modalVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Meal</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.photoContainer}>
            <TouchableOpacity
              style={styles.photoFrame}
              onPress={handlePhotoSelection}>
              <Text style={styles.photoFrameText}>
                {imageUris.length === 0 ? "Add Photos" : "Change Photos"}
              </Text>
            </TouchableOpacity>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {imageUris.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    onPress={() => handleDeleteImage(index)}
                    style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter meal name"
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter meal description"
            value={description}
            onChangeText={setDescription}
          />
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <Tag
                key={tag}
                tag={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => handleToggleTag(tag)}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
            <Text style={styles.addButtonText}>Zverejnit</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    position: "relative",
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
    height: 100,
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 30,
    color: "#D3D3D3",
  },
  photoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  photoFrame: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    marginRight: 8,
  },
  photoFrameText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    width: "100%",
    justifyContent: "space-evenly",
  },
  tag: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 3,
  },
  selectedTag: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  tagText: {
    color: "#333",
    fontSize: 14,
  },
});

export default AddMealModal;
