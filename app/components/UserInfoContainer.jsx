import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";

const UserInfoContainer = ({ onPhoneNumberSave }) => {
  const { user, refreshUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.number || null);
  const [userName, setUserName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update state when user prop changes
  useEffect(() => {
    console.log("User changed, updating user info state");
    if (user?.number !== undefined) {
      setPhoneNumber(user.number);
    }
    if (user?.name !== undefined) {
      setUserName(user.name);
    }
  }, [user]);

  const handleSaveUserInfo = async (newPhoneNumber, newUserName) => {
    try {
      if (user && user.$id) {
        setIsUpdating(true); // Show local loading indicator
        console.log("Saving user info:", {
          name: newUserName,
          phone: newPhoneNumber,
        });
        setModalVisible(false);

        // Update the database
        const updateResult = await handleUpdateUser(
          user.$id,
          newUserName,
          newPhoneNumber
        );

        if (updateResult.success) {
          // Update local state immediately
          setPhoneNumber(newPhoneNumber);
          setUserName(newUserName);
          onPhoneNumberSave(newPhoneNumber);

          console.log("Database update successful, refreshing user data...");

          // Use silent refresh to avoid global loading state
          setTimeout(async () => {
            await refreshUser(true); // Pass true for silent refresh
            console.log("User data refreshed");
            setIsUpdating(false); // Hide local loading indicator
          }, 1000);
        } else {
          Alert.alert(
            "Error",
            "Failed to update user information. Please try again."
          );
          setIsUpdating(false);
        }
      }
    } catch (error) {
      console.error("Error saving user info:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setIsUpdating(false);
    }
  };

  async function handleUpdateUser(userId, newName, newNumber) {
    const result = await authService.updateUserNameAndNumber(
      userId,
      newName,
      newNumber
    );

    if (result.success) {
      console.log("User updated in database:", result.updatedDocument);
    } else {
      console.error("Failed to update user in database:", result.error);
    }

    return result;
  }

  return (
    <View style={styles.container}>
      {/* Name Container
      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={24} color="#01766A" />
        <Text style={styles.infoText}>{userName || "Not Provided"}</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.editIconButton}>
          <MaterialIcons name="edit" size={20} color="#01766A" />
        </TouchableOpacity>
      </View> */}

      {/* Phone Container */}
      <View style={[styles.infoRow]}>
        <MaterialIcons name="phone" size={24} color="#01766A" />
        <Text style={styles.infoText}>
          {phoneNumber ? phoneNumber : "Not Provided"}
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.editIconButton}>
          <MaterialIcons name="edit" size={20} color="#01766A" />
        </TouchableOpacity>
      </View>
      {/* Show loading indicator when updating */}
      {isUpdating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#01766A" />
          <Text style={styles.loadingText}>Updating profile...</Text>
        </View>
      )}
      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit User Information</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={userName || ""}
                onChangeText={setUserName}
                placeholder="Your name"
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={phoneNumber || ""}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="+420XXXXXXXXX"
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => handleSaveUserInfo(phoneNumber, userName)}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoText: {
    fontSize: 16,
    color: "#01766A",
    marginLeft: 5,
    flex: 1,
  },
  editIconButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "stretch",
    width: "80%",
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  modalInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    width: "100%",
    borderRadius: 5,
  },
  modalSaveButton: {
    backgroundColor: "#01766A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginTop: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#01766A",
  },
});

export default UserInfoContainer;
