import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamilies } from "../../theme/typography";
import type { MainTabParamList } from "../../navigation/types";

type TabKey = keyof MainTabParamList;

const leftTabs: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: "Catalog", label: "Home", icon: "home" },
  { key: "Search", label: "Search", icon: "search" },
];

const rightTabs: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: "MyLessons", label: "Explore", icon: "compass" },
  { key: "Profile", label: "Profile", icon: "user" },
];

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name as TabKey;

  const navigate_tab = (name: TabKey) => {
    const event = navigation.emit({
      type: "tabPress",
      target: state.routes.find((route) => route.name === name)?.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  const resume_learning = () => {
    navigation.navigate("MyLessons");
  };

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resume learning"
        onPress={resume_learning}
        style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
      >
        <Feather name="play" size={24} color={colors.primaryForeground} />
      </Pressable>
      <View style={styles.bar}>
        <View style={styles.side}>
          {leftTabs.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              active={activeRoute === tab.key}
              onPress={() => navigate_tab(tab.key)}
            />
          ))}
        </View>
        <View style={styles.fabSpacer} />
        <View style={styles.side}>
          {rightTabs.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              active={activeRoute === tab.key}
              onPress={() => navigate_tab(tab.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.tabButton}
    >
      <Feather
        name={icon}
        size={20}
        color={active ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.cardGlass,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bar: {
    height: spacing.tabBarHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  side: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  fabSpacer: {
    width: 56,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    top: -spacing.tabBarFabOffset,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.background,
    zIndex: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
  tabButton: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: fontFamilies.sansSemiBold,
  },
});
