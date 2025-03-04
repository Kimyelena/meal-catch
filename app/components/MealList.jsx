import { View, FlatList } from "react-native";
import MealItem from "./MealItem";

const MealList = ({ meal, onDelete, onEdit }) => {
  return (
    <View>
      <FlatList
        data={meal}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <MealItem meal={item} onDelete={onDelete} onEdit={onEdit} />
        )}
      />
    </View>
  );
};

export default MealList;
