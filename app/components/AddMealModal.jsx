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
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIN_INPUT_HEIGHT = 70;
const MAX_INPUT_HEIGHT = 150;

const AddMealModal = ({ modalVisible, setModalVisible, addMeal }) => {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [originalImageUris, setOriginalImageUris] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [descriptionInputHeight, setDescriptionInputHeight] =
    useState(MIN_INPUT_HEIGHT);
  const [loading, setLoading] = useState(false);

  const categoryDisplayOrder = ["Handmade", "LongLasting", "Sweets", "Other"];

  const defaultCategory = "Other";

  const categoryIcons = {
    Handmade: "food-bank",
    LongLasting: "local-grocery-store",
    Sweets: "cake",
    Other: "apps",
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
    "Organic",
    "Dairy-free",
    "Nut-free",
    "Low-fat",
    "High-protein",
    "Spicy",
    "Savory",
    "Gourmet",
    "Traditional",
    "Farm-to-table",
    "Non-GMO",
    "Whole30",
    "Comfort food",
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
        setOriginalImageUris((prevUris) => [...prevUris, result.assets[0].uri]);
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
        setOriginalImageUris((prevUris) => [
          ...prevUris,
          ...result.assets.map((asset) => asset.uri),
        ]);
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
      setLoading(true);

      console.log("Sending original image URIs:", originalImageUris);

      await addMeal(
        mealName,
        description,
        originalImageUris,
        selectedTags,
        selectedCategory
      );

      console.log("Meal added successfully");

      setMealName("");
      setDescription("");
      setImageUris([]);
      setOriginalImageUris([]);
      setUploadedImageUrls([]);
      setSelectedTags([]);
      setSelectedCategory(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", `Failed to add meal: ${error.message}`);
    } finally {
      setLoading(false);
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
    setOriginalImageUris((prevUris) =>
      prevUris.filter((_, index) => index !== indexToDelete)
    );
  };

  useEffect(() => {
    if (!modalVisible) {
      setMealName("");
      setDescription("");
      setImageUris([]);
      setOriginalImageUris([]);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Offer Food</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
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
                placeholder="What food are you offering?"
                value={mealName}
                onChangeText={setMealName}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                  { height: descriptionInputHeight },
                ]}
                placeholder="Please describe what it is :D"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                blurOnSubmit={true}
                returnKeyType="done"
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
                        categoryIcons[category] ||
                        categoryIcons[defaultCategory]
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
              <View style={styles.bottomPadding} />
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                Keyboard.dismiss();
                handleAddMeal();
              }}>
              <Text style={styles.addButtonText}>
                {loading ? "Uploading..." : "Add Meal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  // scrollView: {
  //   width: "100%",
  // },
  // scrollViewContent: {
  //   alignItems: "center",
  //   paddingBottom: 80,
  // },
  addButton: {
    backgroundColor: "#01766A",
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
    fontSize: 20,
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
    width: 100,
    height: 10,
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
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
    marginTop: 5,
    marginBottom: 10,
    alignSelf: "flex-start",
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
    backgroundColor: "#9DC183",
    borderColor: "#98FF98s",
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
    backgroundColor: "#9DC183",
    color: "#fff",
  },
  tagText: {
    color: "#333",
    fontSize: 14,
  },
  bottomPadding: {
    height: 70,
  },
});

export default AddMealModal;
