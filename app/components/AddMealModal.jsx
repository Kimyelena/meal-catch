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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIN_INPUT_HEIGHT = 70;
const MAX_INPUT_HEIGHT = 150;

const AddMealModal = ({ modalVisible, setModalVisible, addMeal }) => {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [descriptionInputHeight, setDescriptionInputHeight] =
    useState(MIN_INPUT_HEIGHT);

  const categoryDisplayOrder = [
    "Handmade",
    "LongLasting",
    "Sweets",
    "Nutrition",
    "Other",
  ];

  const defaultCategory = "Other";

  const categoryIcons = {
    Handmade: "food-bank",
    LongLasting: "local-grocery-store",
    Sweets: "cake",
    Nutrition: "vegetables",
    Other: "category",
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
    setSelectedCategory(null);
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
              {imageUris.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    onPress={() => handleDeleteImage(index)}
                    style={styles.deleteButton}>
                    <Text>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Jake jidlo nabizete?"
            value={mealName}
            onChangeText={setMealName}
          />

          {/* === MODIFIED DESCRIPTION INPUT === */}
          <TextInput
            style={[
              styles.input, // Apply base input styles
              styles.descriptionInput, // Apply specific description styles (like minHeight)
              // Apply the dynamic height from state
              { height: descriptionInputHeight },
              // Note: Math.max(MIN_INPUT_HEIGHT, descriptionInputHeight) is technically safer
              // if state could somehow be set below minHeight, but usually not needed.
            ]}
            placeholder="Popis prosim, co to je :D" // Your placeholder
            value={description}
            onChangeText={setDescription}
            multiline={true} // <= IMPORTANT: Allow multiple lines
            onContentSizeChange={(event) => {
              // <= IMPORTANT: Update height on content change
              const newHeight = event.nativeEvent.contentSize.height;
              // Update state, but limit by MAX_INPUT_HEIGHT and ensure it's not less than MIN_INPUT_HEIGHT
              setDescriptionInputHeight(
                Math.max(
                  MIN_INPUT_HEIGHT,
                  Math.min(newHeight, MAX_INPUT_HEIGHT)
                )
              );
              // If you want unlimited growth within the ScrollView, remove Math.min:
              // setDescriptionInputHeight(Math.max(MIN_INPUT_HEIGHT, newHeight));
            }}
            // Optional: Make Return key add a new line instead of submitting form
            // blurOnSubmit={false}
          />
          {/* ================================= */}

          {/* --- Category Selection UI --- */}
          {/* <Text style={styles.sectionTitle}>Select Category:</Text> */}
          <View style={styles.categoriesContainer}>
            {/* Map over the LOCALLY defined categoryDisplayOrder */}
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
  // modalContent: {
  //   width: "90%",
  //   maxHeight: "90%", // Crucial for ScrollView to work within the modal view
  //   backgroundColor: "#fff",
  //   borderRadius: 10,
  //   padding: 20,
  //   alignItems: "center",
  //   marginVertical: 20, // Ensure space for scrolling
  // },
  modalContent: {
    width: "95%",
    height: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  // input: {
  //   width: "100%",
  //   padding: 10,
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: 8,
  //   marginBottom: 1,
  // },
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
    // zIndex: 3,
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
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
