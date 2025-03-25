import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../app/contexts/AuthContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";

const RootLayout = () => {
  const router = useRouter();

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ff8c00" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          headerRight: () => <AccountIcon />,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account" options={{ title: "Account" }} />
      </Stack>
    </AuthProvider>
  );
};

const AccountIcon = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/account")}
      style={{ marginRight: 15 }}>
      <MaterialIcons name="account-circle" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

export default RootLayout;
