import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: false, // Disable swipe back gesture globally
        headerShown: false, // Optional: Hide the header if not needed
      }}>
      {/* Ensure all screens under this layout inherit these options */}
    </Stack>
  );
};

export default AuthLayout;
