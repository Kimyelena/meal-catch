// meal details, how details displayed to all users across the platform
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";

const MealItemView = ({ meal }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <View style={styles.mealItem}>
        {meal.imageUris && meal.imageUris.length > 0 && (
          <Image source={{ uri: meal.imageUris[0] }} style={styles.mealImage} />
        )}
        <Text style={styles.mealText}>{meal.name}</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{meal.name}</Text>
            <ScrollView horizontal={true}>
              {meal.imageUris &&
                meal.imageUris.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.detailImage}
                  />
                ))}
            </ScrollView>
            <Text style={styles.modalDescription}>{meal.description}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  mealText: {
    fontSize: 18,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
  },
});

export default MealItemView;
