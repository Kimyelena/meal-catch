import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import authService from "../services/authService";

const { height } = Dimensions.get("window");

const MealItemView = ({ meal, onClose, visible }) => {
  const modalAnimation = useRef(new Animated.Value(height)).current;
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [mealDetails, setMealDetails] = useState({});

  useEffect(() => {
    if (visible && meal.user_id) {
      const fetchUserDetails = async () => {
        try {
          const userDetails = await authService.getUserDetails(meal.user_id);
          if (userDetails) {
            setMealDetails({
              ownerName: userDetails.name,
              ownerNumber: userDetails.number,
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    } else {
      setMealDetails({});
    }
  }, [visible, meal.user_id]);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnimation, {
        toValue: height * 0.65,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: height,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const handlePhonePress = () => {
    setShowPhoneNumber(!showPhoneNumber);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      style={{
        justifyContent: "flex-end",
      }}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { height: modalAnimation }]}>
          <Text style={styles.modalTitle}>{meal.name}</Text>

          <ScrollView horizontal={true} style={styles.imageScroll}>
            {meal.imageUris &&
              meal.imageUris.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.detailImage}
                />
              ))}
          </ScrollView>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userNameText}>By: {mealDetails.ownerName}</Text>
            <TouchableOpacity onPress={handlePhonePress}>
              <View style={styles.phoneContainer}>
                <MaterialIcons name="phone" size={24} color="#007bff" />
                <Text style={styles.phoneText}>Contact</Text>
              </View>
            </TouchableOpacity>
            {showPhoneNumber && (
              <Text style={styles.phoneNumberText}>
                {mealDetails.ownerNumber}
              </Text>
            )}
          </View>

          <Text style={styles.modalDescription}>{meal.description}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  imageScroll: {
    maxHeight: 200,
    marginBottom: 10,
  },
  detailImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    marginRight: 10,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 16,
    color: "#007bff",
    marginLeft: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneNumberText: {
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default MealItemView;
