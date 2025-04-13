import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService"; // Fix import to get the entire service

const UserInfoContainer = ({ onPhoneNumberSave }) => {
  const { user, refreshUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.number || null);

  const handleSavePhoneNumber = async (newPhoneNumber) => {
    onPhoneNumberSave(newPhoneNumber);
    setPhoneNumber(newPhoneNumber);
    setModalVisible(false);
    console.log("Phone number saved:", newPhoneNumber);
    console.log("phoneNumber state:", newPhoneNumber);

    if (user && user.$id) {
      await handleUpdateUser(user.$id, user.name, newPhoneNumber);

      // Add a small delay before refreshing to ensure database update completes
      setTimeout(async () => {
        await refreshUser();
        console.log("User refreshed after update");
      }, 500);
    }
  };

  async function handleUpdateUser(userId, newName, newNumber) {
    // Use the correct method from authService
    const result = await authService.updateUserNameAndNumber(
      userId,
      newName,
      newNumber
    );

    if (result.success) {
      console.log("User updated:", result.updatedDocument);
    } else {
      console.error("Failed to update user:", result.error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.phoneContainer}>
        <MaterialIcons name="phone" size={24} color="#01766A" />
        <Text style={styles.phoneText}>
          {phoneNumber ? phoneNumber : "Not Provided"}
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.editIconButton}>
          <MaterialIcons name="edit" size={20} color="#01766A" />
        </TouchableOpacity>
      </View>

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

            <Text style={styles.modalTitle}>Edit Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={phoneNumber || ""}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+420XXXXXXXXX"
            />

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => handleSavePhoneNumber(phoneNumber)}>
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
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneText: {
    fontSize: 16,
    color: "#01766A",
    marginLeft: 5,
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
    alignItems: "center",
    width: "80%",
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  modalInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 25,
    paddingHorizontal: 10,
    width: "90%",
    borderRadius: 5,
  },
  modalSaveButton: {
    backgroundColor: "#01766A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignSelf: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  editIconButton: {
    padding: 5,
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
});

export default UserInfoContainer;
