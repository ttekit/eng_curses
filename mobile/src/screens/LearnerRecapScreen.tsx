import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { ContentWatchHeader } from "../components/ContentWatchHeader";
import { AppButton } from "../components/AppButton";
import {
  generate_learner_recap,
  submit_learner_recap,
  type GenerateRecapResponse,
  type RecapKind,
} from "../lib/learner_recap";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { surfaceStyles } from "../theme/surface_styles";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"LearnerRecap">;
type QuizQuestion = GenerateRecapResponse["tests"][number];

export function LearnerRecapScreen({ navigation, route }: Props) {
  const kind: RecapKind = route.params.kind;
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<GenerateRecapResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await generate_learner_recap(kind);
      if (response && "error" in response) {
        setResult(response.error);
      } else {
        setBundle(response);
      }
      setLoading(false);
    };
    void load();
  }, [kind]);

  const questions = useMemo(() => bundle?.tests ?? [], [bundle?.tests]);

  const handle_submit = async () => {
    if (!bundle) {
      return;
    }
    setSubmitting(true);
    const response = await submit_learner_recap(kind, bundle.gradingToken, answers);
    setSubmitting(false);
    if (!response) {
      setResult("Could not submit recap.");
      return;
    }
    setResult(`${response.correct}/${response.total} correct (${response.percentage}%)`);
  };

  return (
    <ScreenContainer padded={false}>
      <ContentWatchHeader onBack={() => navigation.goBack()} />
      {loading ? (
        <LoadingCenter />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{bundle?.recapLabel ?? "Recap quiz"}</Text>
          {result ? <Text style={styles.result}>{result}</Text> : null}
          {questions.map((question, index) => (
            <QuestionBlock
              key={question.id ?? String(index)}
              question={question}
              selectedIndex={answers[question.id ?? String(index)]}
              onSelect={(optionIndex) =>
                setAnswers((current) => ({
                  ...current,
                  [question.id ?? String(index)]: optionIndex,
                }))
              }
            />
          ))}
          {bundle && !result ? (
            <AppButton
              label="Submit recap"
              loading={submitting}
              onPress={() => void handle_submit()}
            />
          ) : null}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

type QuestionBlockProps = {
  question: QuizQuestion;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
};

function QuestionBlock({ question, selectedIndex, onSelect }: QuestionBlockProps) {
  const options = question.options ?? [];
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question.question}</Text>
      {options.map((option, index) => (
        <Pressable
          key={`${question.id}-${option}`}
          onPress={() => onSelect(index)}
          style={[styles.option, selectedIndex === index ? styles.optionActive : null]}
        >
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.itemGap,
    paddingBottom: 32,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  result: {
    ...typography.bodySemiBold,
    color: colors.accent,
    textAlign: "center",
  },
  card: {
    ...surfaceStyles.card,
    gap: 8,
  },
  question: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  option: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(129, 61, 236, 0.12)",
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
});
