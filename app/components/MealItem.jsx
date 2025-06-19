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
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import mealService from "../services/mealService";

const { height } = Dimensions.get("window");

// Function to prefetch an image to check its validity
const prefetchImage = async (uri) => {
  if (!uri) return false;
  try {
    const response = await fetch(uri, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Error prefetching image:", uri, error);
    return false;
  }
};

const MealItem = ({ meal, onClose, refreshMeals }) => {
  // isEditing: Controls whether the meal details are in editable input fields or display text.
  // Set to false by default to start in viewing mode.
  const [isEditing, setIsEditing] = useState(false);

  // States to hold the editable data for the meal
  const [editedName, setEditedName] = useState(meal.name || "");
  const [editedDescription, setEditedDescription] = useState(
    meal.description || ""
  );
  // editedImageUris: Currently only for displaying existing images, not for adding/removing new ones in this component.
  const [editedImageUris, setEditedImageUris] = useState(meal.imageUris || []);
  const [editedTags, setEditedTags] = useState(meal.tags || []);
  const [newTag, setNewTag] = useState("");

  // Animation setup for the modal's height
  const modalAnimation = useRef(new Animated.Value(0)).current;
  // modalVisible: Controls the visibility of the React Native Modal component.
  const [modalVisible, setModalVisible] = useState(true);

  // imageStatus: Stores loading/error state for each image URI to display indicators/placeholders.
  const [imageStatus, setImageStatus] = useState({});

  // useEffect for modal animation and state reset upon closing
  useEffect(() => {
    if (modalVisible) {
      // Animate modal open
      Animated.timing(modalAnimation, {
        toValue: height * 0.65, // Modal will animate up to 65% of screen height
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate modal close
      Animated.timing(modalAnimation, {
        toValue: 0, // Animate height to 0
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // After close animation completes, reset states and call parent's onClose
        setIsEditing(false); // Ensure editing mode is off for next open
        setNewTag(""); // Clear new tag input field
        modalAnimation.setValue(0); // Reset animation value for next open
        onClose(); // Inform parent to unmount this component or hide it
      });
    }
  }, [modalVisible, modalAnimation, height, onClose]);

  // useEffect to manage the loading status of images
  useEffect(() => {
    const fetchAndSetImageStatuses = async () => {
      const newStatusUpdates = {};
      const urisToProcess = [];

      // Identify images that need their status checked
      for (const uri of editedImageUris) {
        if (
          !imageStatus[uri] ||
          (!imageStatus[uri].valid && !imageStatus[uri].error)
        ) {
          newStatusUpdates[uri] = { loading: true, error: false, valid: false };
          urisToProcess.push(uri);
        }
      }

      // Apply initial loading states if any images are being processed
      if (Object.keys(newStatusUpdates).length > 0) {
        setImageStatus((prev) => ({ ...prev, ...newStatusUpdates }));
      }

      // Prefetch images and update their final status
      for (const uri of urisToProcess) {
        // Skip if already confirmed valid to avoid unnecessary re-fetches
        if (imageStatus[uri]?.valid) continue;

        const isValid = await prefetchImage(uri);
        setImageStatus((prev) => ({
          ...prev,
          [uri]: { loading: false, error: !isValid, valid: isValid },
        }));
      }
    };

    fetchAndSetImageStatuses();

    // Clean up imageStatus for URIs that are no longer present in editedImageUris
    setImageStatus((prev) => {
      const currentUrisSet = new Set(editedImageUris);
      const cleanedStatus = {};
      for (const uri in prev) {
        if (currentUrisSet.has(uri)) {
          cleanedStatus[uri] = prev[uri];
        }
      }
      return cleanedStatus;
    });
  }, [editedImageUris]); // Re-run this effect if the list of image URIs changes

  // useEffect to update local states when the 'meal' prop changes
  // This is crucial if the parent component updates the 'meal' prop
  // without unmounting and remounting the MealItem component.
  useEffect(() => {
    setEditedName(meal.name || "");
    setEditedDescription(meal.description || "");
    setEditedImageUris(meal.imageUris || []);
    setEditedTags(meal.tags || []);
    // When a new meal prop arrives, reset to view mode
    setIsEditing(false);
  }, [meal]); // Dependency on the 'meal' object

  // Handles saving the edited meal details
  const handleSave = async () => {
    try {
      const response = await mealService.updateMeal(
        meal.$id, // Original meal ID
        editedName,
        editedDescription,
        meal.imageUris, // IMPORTANT: Using original meal.imageUris as per your existing code (no image editing in this modal)
        editedTags
      );
      console.log("Update response:", response);

      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setIsEditing(false); // Exit editing mode
        setModalVisible(false); // Close the modal (this triggers the useEffect cleanup)
        refreshMeals(); // Notify parent to refresh meal list
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update meal.");
    }
  };

  // Handles deleting the meal
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
              setModalVisible(false); // Close the modal
              refreshMeals(); // Notify parent to refresh meal list
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete meal.");
          }
        },
      },
    ]);
  };

  // Adds a new tag to the editedTags array
  const addTag = () => {
    if (newTag.trim() !== "" && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag(""); // Clear the input field
    } else if (newTag.trim() === "") {
      Alert.alert("Info", "Tag cannot be empty.");
    } else if (editedTags.includes(newTag.trim())) {
      Alert.alert("Info", "This tag already exists.");
    }
  };

  // Removes a tag from the editedTags array
  const removeTag = (tagToRemove) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      // onRequestClose is called when the user taps outside the modal or uses the hardware back button (Android)
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { height: modalAnimation }]}>
          {/* Close button for the modal */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {/* Scrollable content area for meal details (images, tags, name, description) */}
            <View style={styles.scrollableContent}>
              {/* Image ScrollView: Configured for horizontal scrolling */}
              <ScrollView
                horizontal={true} // Enable horizontal scrolling
                showsHorizontalScrollIndicator={true} // Show the scroll indicator for better UX (you had false, but true is helpful for debugging/user feedback)
                contentContainerStyle={styles.imageScrollContentContainer} // Styles for the content *inside* the ScrollView
                style={styles.imageScrollView} // Styles for the ScrollView container itself
              >
                {editedImageUris.length > 0 ? (
                  editedImageUris.map((uri) => {
                    // Removed 'index' from here, using 'uri' as key
                    // Determine image status (loading, error, valid)
                    const status = imageStatus[uri] || {
                      loading: true,
                      error: false,
                      valid: false,
                    };

                    return (
                      <View
                        key={uri} // <--- CRITICAL CHANGE: Using 'uri' directly as the key
                        style={styles.imageWrapper} // Wrapper for each image, defines its dimensions
                      >
                        {/* Show ActivityIndicator while image is loading */}
                        {status.loading && !status.error && (
                          <ActivityIndicator
                            style={styles.imageLoader}
                            size="small"
                            color="#007bff"
                          />
                        )}
                        {/* Image component */}
                        <Image
                          style={styles.detailImage} // Fixed dimensions for the image
                          source={
                            status.error || !status.valid
                              ? require("../../assets/placeholder.png") // Fallback image on error/invalid URI
                              : { uri }
                          }
                          // Event handlers for image loading lifecycle
                          onLoadStart={() => {
                            if (!status.loading && !status.error) {
                              setImageStatus((prev) => ({
                                ...prev,
                                [uri]: {
                                  ...prev[uri],
                                  loading: true,
                                  error: false,
                                },
                              }));
                            }
                          }}
                          onLoadEnd={() => {
                            setImageStatus((prev) => ({
                              ...prev,
                              [uri]: { ...prev[uri], loading: false },
                            }));
                          }}
                          onError={(e) => {
                            console.error(
                              "Failed to load image:",
                              uri,
                              e.nativeEvent.error
                            );
                            setImageStatus((prev) => ({
                              ...prev,
                              [uri]: {
                                ...prev[uri],
                                error: true,
                                loading: false,
                                valid: false,
                              },
                            }));
                          }}
                        />
                      </View>
                    );
                  })
                ) : (
                  // Display a placeholder if no images are available
                  <View style={styles.noImageFrame}>
                    <Text style={styles.noImageText}>No images available</Text>
                    <Icon name="image-not-supported" size={50} color="#ccc" />
                  </View>
                )}
              </ScrollView>

              {/* Tags section */}
              <View style={styles.tagsContainer}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagScrollContentContainer}>
                  {editedTags.map((tag) => (
                    <View key={tag} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag || ""}</Text>
                      {isEditing && (
                        <TouchableOpacity
                          onPress={() => removeTag(tag)}
                          style={styles.tagDeleteButton}>
                          <Text style={styles.tagDeleteButtonText}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Add Tag input and button (only visible in editing mode) */}
              {isEditing && (
                <View style={styles.addTagContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add a tag"
                    onSubmitEditing={addTag} // Add tag on keyboard 'done'
                    returnKeyType="done"
                    blurOnSubmit={false} // Keep keyboard open after adding
                  />
                  <TouchableOpacity
                    onPress={addTag}
                    style={styles.addTagButton}>
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Meal Name input/display */}
              <View style={styles.mealNameContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus // Focus on name when entering edit mode
                    placeholder="Meal Name"
                    returnKeyType="done"
                  />
                ) : (
                  <Text style={styles.modalTitle}>
                    {editedName || "No Name"}
                  </Text>
                )}
              </View>

              {/* Meal Description input/display */}
              {isEditing ? (
                <TextInput
                  style={styles.descriptionInput}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  multiline
                  numberOfLines={4}
                  placeholder="Meal Description"
                  returnKeyType="done"
                />
              ) : (
                <Text style={styles.modalDescription}>
                  {editedDescription || "No description provided."}
                </Text>
              )}
            </View>

            {/* Footer with action buttons (Save/Edit, Delete) */}
            <View style={styles.modalActionsContainer}>
              <View style={styles.modalActions}>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.actionButton}>
                    <Icon name="check" size={24} color="green" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.actionButton}>
                    <Icon name="edit" size={24} color="gray" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleDeleteMeal}
                  style={styles.actionButton}>
                  <Icon name="delete" size={24} color="gray" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    textAlign: "center",
    marginBottom: 5,
  },
  detailImage: {
    width: 250, // Fixed width for each image
    height: 250, // Fixed height for each image
    borderRadius: 5,
  },
  modalDescription: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlign: "justify",
  },
  modalActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
    zIndex: 10, // Ensures the button is tappable over other content
  },
  closeButtonText: {
    fontSize: 24,
    color: "#888",
  },
  input: {
    fontSize: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 5,
    textAlign: "center",
    paddingVertical: 5,
  },
  descriptionInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  imageWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10, // Provides space between images in the scroll view
    // Explicitly set width/height on the wrapper too, important for layout calculations
    width: 250,
    height: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageLoader: {
    position: "absolute",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  scrollableContent: {
    flex: 1, // Allows this section to grow and enable its own vertical scrolling if needed
  },
  imageScrollView: {
    maxHeight: 250, // Limits the vertical space taken by images
    marginBottom: 10,
    // By default, a horizontal ScrollView will expand its content width.
    // No explicit width on the ScrollView itself is needed if its parent allows it to take full width.
  },
  imageScrollContentContainer: {
    // This style is applied to the content *inside* the ScrollView.
    // crucial for ensuring items lay out horizontally and for correct scrolling.
    flexDirection: "row", // Ensures children are laid out in a row
    alignItems: "center", // Vertically centers images if their heights vary within the maxHeight
    paddingRight: 10, // Provides padding after the last image so it's not cut off at the edge
  },
  mealNameContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  tagsContainer: {
    marginVertical: 10,
    minHeight: 40, // Ensures space even if no tags
  },
  tagScrollContentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagItem: {
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  tagDeleteButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  tagDeleteButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 18,
  },
  addTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  addTagButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addTagButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  noImageFrame: {
    flex: 1, // Allows it to stretch to fill the available width in the ScrollView
    justifyContent: "center",
    alignItems: "center",
    height: 250, // Matches the height of actual image wrappers
    width: Dimensions.get("window").width - 40, // Fills screen width minus modal padding
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  noImageText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default MealItem;
