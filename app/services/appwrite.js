import { Client, Databases, Account } from "react-native-appwrite";

const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  db: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  col: {
    meals: process.env.EXPO_PUBLIC_APPWRITE_COL_MEALS_ID,
  },
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const database = new Databases(client);
const account = new Account(client);

export default {
  client,
  database,
  account,
  config,
};

export { client, database, account, config };
