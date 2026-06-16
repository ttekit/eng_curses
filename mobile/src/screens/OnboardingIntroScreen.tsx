import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { ChameleonMascot, type ChameleonMood } from "../components/ChameleonMascot";
import { mark_onboarding_intro_seen } from "../lib/onboarding_intro_storage";
import { onboardingIntroStyles as styles } from "./onboarding_intro_styles";

type Props = RootStackScreenProps<"OnboardingIntro">;

type Slide = {
  mood: ChameleonMood;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
};

const slides: readonly Slide[] = [
  {
    mood: "waving",
    icon: "star",
    title: "Meet Rex",
    body: "Your color-changing companion adapts every lesson to how you learn best.",
  },
  {
    mood: "excited",
    icon: "film",
    title: "Learn from real video",
    body: "Watch shows, clips, and stories you love, then practice what you just heard.",
  },
  {
    mood: "thinking",
    icon: "target",
    title: "Personalized for you",
    body: "Tell us your interests and goals. Exply builds a path that fits your life.",
  },
];

export function OnboardingIntroScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];
  const isLast = index === slides.length - 1;

  const finish_intro = async () => {
    await mark_onboarding_intro_seen();
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const open_level_test = async () => {
    await mark_onboarding_intro_seen();
    navigation.reset({
      index: 1,
      routes: [{ name: "MainTabs" }, { name: "LevelTest" }],
    });
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <Pressable onPress={() => void finish_intro()} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={styles.center}>
          <ChameleonMascot size="xl" mood={slide.mood} />
          <View style={styles.stepPill}>
            <Feather name={slide.icon} size={16} color={styles.stepText.color} />
            <Text style={styles.stepText}>Step {index + 1} of {slides.length}</Text>
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.dots}>
          {slides.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                dotIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {isLast ? (
            <>
              <AppButton label="Take the level test" onPress={() => void open_level_test()} />
              <AppButton label="Skip for now" variant="ghost" onPress={() => void finish_intro()} />
            </>
          ) : (
            <AppButton label="Continue" onPress={() => setIndex((value) => value + 1)} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
