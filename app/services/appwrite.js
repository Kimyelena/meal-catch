import { Client, Account, Databases, Storage } from 'react-native-appwrite';

// Initialize the Appwrite client
const client = new Client();

// AppWrite Config
const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID, // Make sure this is defined
  collectionId: process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID,
};

// Project connection
client.setEndpoint(config.endpoint).setProject(config.projectId);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);  // Changed from 'database' to 'databases'
const storage = new Storage(client);

// Debug config
console.log('Appwrite config:');
console.log('- endpoint:', config.endpoint);
console.log('- projectId:', config.projectId);
console.log('- bucketId:', config.bucketId);
console.log('- databaseId:', config.databaseId);

export { client, account, databases, storage, config };  // Export 'databases' instead of 'database'
