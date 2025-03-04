import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

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

    console.log("✏️ Ukládám změny:", editedText);
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
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              console.log("✏️ Editace jídla:", meal.$id);
              setIsEditing(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            console.log("🗑 Mažu jídlo:", meal.$id);
            onDelete(meal.$id);
          }}>
          <Text style={styles.deleteButton}>Delete</Text>
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
  editButton: {
    fontSize: 16,
    color: "blue",
    marginRight: 10,
  },
  saveButton: {
    fontSize: 16,
    color: "green",
    marginRight: 10,
  },
  deleteButton: {
    fontSize: 16,
    color: "red",
  },
});

export default MealItem;
