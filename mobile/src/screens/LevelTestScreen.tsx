import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type DemoQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    prompt: "Choose the correct greeting:",
    options: ["Good night", "Good morning", "Good homework", "Good pencil"],
    correctIndex: 1,
  },
  {
    prompt: "Past tense of “go”:",
    options: ["goed", "went", "gone", "going"],
    correctIndex: 1,
  },
  {
    prompt: "Synonym of “happy”:",
    options: ["sad", "angry", "glad", "tired"],
    correctIndex: 2,
  },
  {
    prompt: "Article before “apple”:",
    options: ["a", "an", "the", "—"],
    correctIndex: 1,
  },
  {
    prompt: "Opposite of “hot”:",
    options: ["warm", "cold", "cooler", "heat"],
    correctIndex: 1,
  },
];

type Props = RootStackScreenProps<"LevelTest">;

export function LevelTestScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = DEMO_QUESTIONS[index];

  const handle_answer = (optionIndex: number) => {
    if (!question) {
      return;
    }
    const nextScore = optionIndex === question.correctIndex ? score + 1 : score;
    const nextIndex = index + 1;
    if (nextIndex >= DEMO_QUESTIONS.length) {
      setScore(nextScore);
      setFinished(true);
      return;
    }
    setScore(nextScore);
    setIndex(nextIndex);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Demo level test</Text>
      <Text style={styles.body}>
        This is a short sample quiz. The full placement test runs on the web catalog.
      </Text>
      {finished ? (
        <View style={styles.resultBox}>
          <Text style={styles.result}>
            You scored {score}/{DEMO_QUESTIONS.length}
          </Text>
          <AppButton label="Back to catalog" onPress={() => navigation.goBack()} />
        </View>
      ) : question ? (
        <View style={styles.card}>
          <Text style={styles.progress}>
            Question {index + 1} of {DEMO_QUESTIONS.length}
          </Text>
          <Text style={styles.prompt}>{question.prompt}</Text>
          {question.options.map((option, optionIndex) => (
            <AppButton
              key={option}
              label={option}
              variant="secondary"
              onPress={() => handle_answer(optionIndex)}
              style={styles.option}
            />
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    gap: 10,
  },
  progress: {
    ...typography.caption,
    color: colors.textMuted,
  },
  prompt: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 18,
  },
  option: {
    alignSelf: "stretch",
  },
  resultBox: {
    gap: 16,
    alignItems: "center",
  },
  result: {
    ...typography.bodySemiBold,
    color: colors.accent,
    fontSize: 20,
  },
});
