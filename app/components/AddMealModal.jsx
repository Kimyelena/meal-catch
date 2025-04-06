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
  ActivityIndicator, // For loading indicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import imageService from "../services/imageService"; //  Import imageService

const MIN_INPUT_HEIGHT = 70;
const MAX_INPUT_HEIGHT = 150;

const AddMealModal = ({ modalVisible, setModalVisible, addMeal }) => {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]); //  New state for uploaded URLs
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [descriptionInputHeight, setDescriptionInputHeight] =
    useState(MIN_INPUT_HEIGHT);
  const [loading, setLoading] = useState(false); //  Add loading state

  const categoryDisplayOrder = ["Handmade", "LongLasting", "Sweets", "Other"];

  const defaultCategory = "Other";

  const categoryIcons = {
    Handmade: "food-bank",
    LongLasting: "local-grocery-store",
    Sweets: "cake",
    Others: "category",
  };

  const tags = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Homemade",
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
        setImageUris((prevUris) => [...prevUris, result.assets[0].uri]);
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

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleAddMeal = async () => {
    if (!mealName || !mealName.trim()) {
      alert("Meal name cannot be empty");
      return;
    }

    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }

    try {
      setLoading(true); //  Start loading

      const uploadedUrls = [];
      for (const uri of imageUris) {
        const url = await imageService.uploadImageAndGetUrl(
          uri,
          "67f2e60c003e78f626bdd"
        ); //  Replace with your bucket ID
        if (url) {
          uploadedUrls.push(url);
        } else {
          Alert.alert("Error", `Failed to upload one or more images.`);
          setLoading(false);
          return; //  Stop if any upload fails
        }
      }
      console.log(
        "Final uploadedUrls array:",
        JSON.stringify(uploadedUrls, null, 2)
      ); //  <---  USE JSON.stringify

      await addMeal(
        mealName,
        description,
        uploadedUrls,
        selectedTags,
        selectedCategory
      ); //  Use uploadedUrls

      setMealName("");
      setDescription("");
      setImageUris([]);
      setUploadedImageUrls([]);
      setSelectedTags([]);
      setSelectedCategory(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal.");
    } finally {
      setLoading(false); //  Stop loading
    }
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
      setUploadedImageUrls([]);
      setSelectedTags([]);
      setSelectedCategory(null);
      setDescriptionInputHeight(MIN_INPUT_HEIGHT);
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
          <Text style={styles.sectionTitle}>Nabidnout jidlo</Text>
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
              {loading ? (
                <ActivityIndicator size="small" color="#007bff" />
              ) : (
                imageUris.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      onPress={() => handleDeleteImage(index)}
                      style={styles.deleteButton}>
                      <Text>x</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Jake jidlo nabizete?"
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { height: descriptionInputHeight },
            ]}
            placeholder="Popis prosim, co to je :D"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            onContentSizeChange={(event) => {
              const newHeight = event.nativeEvent.contentSize.height;
              setDescriptionInputHeight(
                Math.max(
                  MIN_INPUT_HEIGHT,
                  Math.min(newHeight, MAX_INPUT_HEIGHT)
                )
              );
            }}
          />
          <View style={styles.categoriesContainer}>
            {categoryDisplayOrder.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.selectedCategoryButton,
                ]}
                onPress={() => handleSelectCategory(category)}>
                <MaterialIcons
                  name={
                    categoryIcons[category] || categoryIcons[defaultCategory]
                  }
                  size={20}
                  color={selectedCategory === category ? "#fff" : "#555"}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.selectedCategoryText,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* ----------------------------- */}
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag,
                ]}
                onPress={() => handleToggleTag(tag)}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
            <Text style={styles.addButtonText}>
              {loading ? "Uploading..." : "Zverejnit"}
            </Text>
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
    width: "95%",
    height: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    position: "relative",
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
  },
  closeButtonText: {
    fontSize: 30,
    color: "#D3D3D3",
  },
  photoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    marginRight: 5,
  },
  photoFrameText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 5,
  },
  imagePreview: {
    width: 95,
    height: 95,
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: MIN_INPUT_HEIGHT,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "5%",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    width: "100%",
  },
  categoryButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    margin: 2,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    minWidth: 80,
  },
  selectedCategoryButton: {
    backgroundColor: "#007bff",
    borderColor: "#0056b3",
  },
  categoryIcon: {
    marginBottom: 2,
  },
  categoryText: {
    color: "#333",
    fontSize: 12,
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "bold",
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
