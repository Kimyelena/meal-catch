export default {
  expo: {
    name: "meal-catch",
    slug: "meal-catch",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/meal-catch-logo.png",
    scheme: "mealcatch",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to select images.",
      },
      bundleIdentifier: "com.kimibucko.mealcatch",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/meal-catch-logo.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["READ_MEDIA_IMAGES", "READ_EXTERNAL_STORAGE", "CAMERA"],
      package: "com.kimibucko.mealcatch",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/meal-catch-logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "08e132a8-a52c-4f2a-bdcb-e7dbed9e7d64",
      },
    },
  },
};
