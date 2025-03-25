import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const MealItem = ({ meal, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(meal.text);
  const inputRef = useRef(null);

  const handleSave = () => {
    if (editedText.trim() === "") {
      setEditedText(meal.text);
      setIsEditing(false);
      return;
    }

    onEdit(meal.$id, editedText);
    setIsEditing(false);
  };

  return (
    <View style={styles.mealItem}>
      {isEditing ? (
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={editedText}
          onChangeText={setEditedText}
          autoFocus
          onSubmitEditing={handleSave}
          returnKeyType="done"
        />
      ) : (
        <Text style={styles.mealText}>{meal.text}</Text>
      )}

      <View style={styles.actions}>
        {isEditing ? (
          <TouchableOpacity
            onPress={() => {
              handleSave();
              inputRef.current?.blur();
            }}>
            <Icon name="check" size={24} color="green" style={styles.icon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}>
            <Icon name="edit" size={24} color="gray" style={styles.icon} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            onDelete(meal.$id);
          }}>
          <Icon name="delete" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  mealText: {
    fontSize: 18,
    flex: 1,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 10,
  },
});

export default MealItem;
