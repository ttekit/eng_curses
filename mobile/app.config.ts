const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.explys.com";

export default {
  name: "Explys",
  slug: "explys-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#09090b",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.explys.mobile",
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: "com.explys.mobile",
    adaptiveIcon: {
      backgroundColor: "#09090b",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-video",
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["arm64-v8a"],
          usePrecompiledHeaders: true,
        },
        ios: {
          deploymentTarget: "16.4",
        },
      },
    ],
  ],
  extra: {
    apiBaseUrl,
    apiToken: process.env.EXPO_PUBLIC_API_TOKEN ?? "",
    apiBasicAuthUser: process.env.EXPO_PUBLIC_API_BASIC_AUTH_USER ?? "",
    apiBasicAuthPassword: process.env.EXPO_PUBLIC_API_BASIC_AUTH_PASSWORD ?? "",
    skipSubscriptionEnforcement:
      process.env.EXPO_PUBLIC_SKIP_SUBSCRIPTION_ENFORCEMENT ?? "true",
    turnstileSiteKey:
      process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADSk3etSiWLwGH5-",
    logApiErrors: process.env.EXPO_PUBLIC_LOG_API_ERRORS ?? "1",
  },
};
