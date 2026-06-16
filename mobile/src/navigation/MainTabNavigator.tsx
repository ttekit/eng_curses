import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CatalogScreen } from "../screens/CatalogScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { MyLessonsScreen } from "../screens/MyLessonsScreen";
import { ClassroomScreen } from "../screens/ClassroomScreen";
import { LearningPlanScreen } from "../screens/LearningPlanScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MainTabBar } from "../components/navigation/MainTabBar";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const hiddenTabOptions = {
  tabBarButton: () => null,
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyLessons" component={MyLessonsScreen} />
      <Tab.Screen
        name="Classroom"
        component={ClassroomScreen}
        options={hiddenTabOptions}
      />
      <Tab.Screen
        name="LearningPlan"
        component={LearningPlanScreen}
        options={hiddenTabOptions}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
