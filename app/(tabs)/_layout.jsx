import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useState } from "react";
import AddMealModal from "../../app/components/AddMealModal";
import mealService from "../../app/services/mealService";
import { useAuth } from "../../app/contexts/AuthContext";

const TabNavigator = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const addMeal = async (mealName) => {
    try {
      await mealService.addMeal(mealName);
      alert("Meal added successfully!");
    } catch (error) {
      alert("Error adding meal: " + error.message);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}>
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="search" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="favorite" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "Add Meal",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.addButton}>
                <MaterialIcons name="add" size={30} color="#fff" />
              </View>
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              setModalVisible(true);
            },
          })}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="chat" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <AddMealModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        addMeal={addMeal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  addButton: {
    width: 60,
    height: 60,
    backgroundColor: "#ff8c00",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});

export default TabNavigator;
