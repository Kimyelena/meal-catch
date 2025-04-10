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
import updateUserNameAndNumber from "../services/authService"; // Import updateUserNameAndNumber

const UserInfoContainer = ({ onPhoneNumberSave }) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.number || null);

  const handleSavePhoneNumber = async (newPhoneNumber) => {
    onPhoneNumberSave(newPhoneNumber);
    setPhoneNumber(newPhoneNumber);
    setModalVisible(false);
    console.log("Phone number saved:", newPhoneNumber);
    console.log("phoneNumber state:", newPhoneNumber);

    // Call handleUpdateUser to update the number in the database
    if (user && user.$id) {
      await handleUpdateUser(user.$id, user.name, newPhoneNumber);
    }
  };

  async function handleUpdateUser(userId, newName, newNumber) {
    const result = await updateUserNameAndNumber(userId, newName, newNumber);

    if (result.success) {
      console.log("User updated:", result.updatedDocument);
    } else {
      console.error("Failed to update user:", result.error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.phoneContainer}>
        <MaterialIcons name="phone" size={24} color="#007bff" />
        <Text style={styles.phoneText}>
          Phone: {phoneNumber ? phoneNumber : "Not Provided"}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.editPhoneText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={phoneNumber || ""}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+420XXXXXXXXX"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => handleSavePhoneNumber(phoneNumber)}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    color: "#007bff",
    marginLeft: 5,
  },
  editPhoneText: {
    fontSize: 16,
    color: "#007bff",
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "80%",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  modalSaveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalCancelButton: {
    backgroundColor: "gray",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default UserInfoContainer;
