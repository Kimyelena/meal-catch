import { Client, Databases, Account, Storage } from "react-native-appwrite";

const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  db: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  col: {
    meals: process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID,
    users: process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID,
  },
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export default {
  client,
  databases,
  account,
  config,
};

export { client, databases, account, config, storage };
