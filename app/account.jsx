import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../app/contexts/AuthContext";

const AccountScreen = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default AccountScreen;
