import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUser } from "../context/UserContext";
import { LoginScreen } from "../screens/LoginScreen";
import { CatalogScreen } from "../screens/CatalogScreen";
import { MyLessonsScreen } from "../screens/MyLessonsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SubscribeScreen } from "../screens/SubscribeScreen";
import { ContentScreen } from "../screens/ContentScreen";
import type { MainTabParamList, RootStackParamList } from "./types";
import { colors } from "../theme/colors";
import { userMayUseLearnerApp } from "../lib/subscriptionAccess";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: "Catalog" }} />
      <Tab.Screen
        name="MyLessons"
        component={MyLessonsScreen}
        options={{ title: "My lessons" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

function resolveInitialRoute(
  isLoading: boolean,
  isLoggedIn: boolean,
  mayUseApp: boolean,
): keyof RootStackParamList {
  if (isLoading) {
    return "Login";
  }
  if (!isLoggedIn) {
    return "Login";
  }
  if (!mayUseApp) {
    return "Subscribe";
  }
  return "MainTabs";
}

export function RootNavigator() {
  const { isLoading, isLoggedIn, user } = useUser();
  const mayUseApp = userMayUseLearnerApp(user);
  const initialRoute = resolveInitialRoute(isLoading, isLoggedIn, mayUseApp);

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Subscribe" component={SubscribeScreen} />
        <Stack.Screen name="Content" component={ContentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
