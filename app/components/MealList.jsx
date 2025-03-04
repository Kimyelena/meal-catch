import { View, FlatList, StyleSheet, Text } from "react-native";
import MealItem from "./MealItem";

const MealList = ({ meals, onDelete, onEdit }) => {
  console.log("MealList received meals:", meals);

  return (
    <View style={styles.container}>
      {meals.length === 0 ? (
        <Text style={styles.emptyMessage}>No meals available</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) =>
            item.$id || item.id || Math.random().toString()
          }
          renderItem={({ item }) => (
            <MealItem meal={item} onDelete={onDelete} onEdit={onEdit} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default MealList;
