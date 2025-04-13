import { Client, Storage, Account, Databases, ID } from "react-native-appwrite";

// Initialize the configuration
const config = {
  endpoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
};

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

// Initialize services
const storage = new Storage(client);
const account = new Account(client);
const databases = new Databases(client);

// Export everything needed
export { client, storage, account, databases, config, ID };
