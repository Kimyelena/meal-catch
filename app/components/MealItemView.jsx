import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MealItemView = ({ meal, userName, onPhonePress }) => {
  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{meal.name}</Text>

      <ScrollView horizontal={true} style={styles.imageScroll}>
        {meal.imageUris &&
          meal.imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.detailImage} />
          ))}
      </ScrollView>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userNameText}>By: {userName}</Text>
        <TouchableOpacity onPress={onPhonePress}>
          <View style={styles.phoneContainer}>
            <MaterialIcons name="phone" size={24} color="#007bff" />
            <Text style={styles.phoneText}>Contact</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.modalDescription}>{meal.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default MealItemView;
