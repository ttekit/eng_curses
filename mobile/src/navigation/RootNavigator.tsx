import { StyleSheet, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoadingCenter } from "../components/LoadingCenter";
import { useUser } from "../context/UserContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterNameScreen } from "../screens/RegisterNameScreen";
import { RegisterEmailScreen } from "../screens/RegisterEmailScreen";
import { RegisterPasswordScreen } from "../screens/RegisterPasswordScreen";
import { RegisterDobScreen } from "../screens/RegisterDobScreen";
import { RegisterDetailsScreen } from "../screens/RegisterDetailsScreen";
import { RegisterPreferencesScreen } from "../screens/RegisterPreferencesScreen";
import { RegisterSuccessScreen } from "../screens/RegisterSuccessScreen";
import { EmailVerificationScreen } from "../screens/EmailVerificationScreen";
import { RestoreAccountScreen } from "../screens/RestoreAccountScreen";
import { PricingScreen } from "../screens/PricingScreen";
import { LegalDocumentScreen } from "../screens/LegalDocumentScreen";
import { SubscribeScreen } from "../screens/SubscribeScreen";
import { OnboardingDobScreen } from "../screens/OnboardingDobScreen";
import { OnboardingIntroScreen } from "../screens/OnboardingIntroScreen";
import { ContentScreen } from "../screens/ContentScreen";
import { LessonSummaryScreen } from "../screens/LessonSummaryScreen";
import { CatalogSeriesScreen } from "../screens/CatalogSeriesScreen";
import { LearnerRecapScreen } from "../screens/LearnerRecapScreen";
import { LevelTestScreen } from "../screens/LevelTestScreen";
import { NotFoundScreen } from "../screens/NotFoundScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import type { RootStackParamList } from "./types";
import { colors } from "../theme/colors";
import { layoutStyles } from "../theme/layout_styles";
import { userMayUseLearnerApp } from "../lib/subscriptionAccess";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function resolve_initial_route(
  isLoading: boolean,
  isLoggedIn: boolean,
  mayUseApp: boolean,
  needsDob: boolean,
): keyof RootStackParamList {
  if (isLoading || !isLoggedIn) {
    return "Login";
  }
  if (needsDob) {
    return "OnboardingDob";
  }
  if (!mayUseApp) {
    return "Subscribe";
  }
  return "MainTabs";
}

export function RootNavigator() {
  const { isLoading, isLoggedIn, user } = useUser();
  const mayUseApp = userMayUseLearnerApp(user);
  const needsDob = Boolean(
    isLoggedIn && user && !user.dateOfBirth?.trim() && user.role !== "teacher",
  );
  const initialRoute = resolve_initial_route(isLoading, isLoggedIn, mayUseApp, needsDob);

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <LoadingCenter />
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
        <Stack.Screen name="RegisterName" component={RegisterNameScreen} />
        <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
        <Stack.Screen name="RegisterPassword" component={RegisterPasswordScreen} />
        <Stack.Screen name="RegisterDob" component={RegisterDobScreen} />
        <Stack.Screen name="RegisterDetails" component={RegisterDetailsScreen} />
        <Stack.Screen name="RegisterPreferences" component={RegisterPreferencesScreen} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
        <Stack.Screen name="VerifyEmail" component={EmailVerificationScreen} />
        <Stack.Screen name="RestoreAccount" component={RestoreAccountScreen} />
        <Stack.Screen name="Pricing" component={PricingScreen} />
        <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
        <Stack.Screen name="Subscribe" component={SubscribeScreen} />
        <Stack.Screen name="OnboardingDob" component={OnboardingDobScreen} />
        <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Content" component={ContentScreen} />
        <Stack.Screen name="LessonSummary" component={LessonSummaryScreen} />
        <Stack.Screen name="CatalogSeries" component={CatalogSeriesScreen} />
        <Stack.Screen name="LearnerRecap" component={LearnerRecapScreen} />
        <Stack.Screen name="LevelTest" component={LevelTestScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    ...layoutStyles.center,
    flex: 1,
    backgroundColor: colors.background,
  },
});
