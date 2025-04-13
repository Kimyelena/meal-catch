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
  const [editedTags, setEditedTags] = useState(meal.tags || []);
  const [newTag, setNewTag] = useState("");
  const modalAnimation = useRef(new Animated.Value(0)).current;
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
        setTimeout(() => {
          onClose();
        }, 1);
      });
    }
  }, [modalVisible]);

  const handleSave = async () => {
    try {
      const response = await mealService.updateMeal(
        meal.$id,
        editedName,
        editedDescription,
        editedImageUris,
        editedTags
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

  const addTag = () => {
    if (newTag.trim() !== "" && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove));
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text>X</Text>
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {/* Main content area */}
            <View style={styles.scrollableContent}>
              <ScrollView horizontal={true} style={styles.imageScrollView}>
                {editedImageUris &&
                  editedImageUris.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.detailImage} />
                      {isEditing && (
                        <TouchableOpacity
                          onPress={() => handleDeleteImage(index)}
                          style={styles.deleteButton}>
                          <Text style={styles.deleteButtonText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
              </ScrollView>

              {/* Tags section */}
              <View style={styles.tagsContainer}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {editedTags.map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag}</Text>
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

              {isEditing && (
                <View style={styles.addTagContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add a tag"
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={addTag}
                    style={styles.addTagButton}>
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isEditing && <Button title="Add Image" onPress={pickImage} />}

              <View style={styles.mealNameContainer}>
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
              </View>

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
            </View>

            {/* Footer with buttons always at bottom */}
            <View style={styles.modalActionsContainer}>
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
  },
  input: {
    fontSize: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 5,
    textAlign: "center",
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
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    flex: 1,
  },
  imageScrollView: {
    maxHeight: 250,
    marginBottom: 10,
  },
  mealNameContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  tagItem: {
    backgroundColor: "#f0f0f0",
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
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  tagDeleteButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 14,
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
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addTagButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default MealItem;
