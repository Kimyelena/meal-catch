import { Client, Account, Databases, Storage } from "react-native-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Export both individual services and a default config object
export { account, databases, storage, client };

// Add default export to resolve the warning
export default {
  account,
  databases,
  storage,
  client
};
