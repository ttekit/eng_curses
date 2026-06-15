import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type AppTextInputProps = TextInputProps & {
  label: string;
  centered?: boolean;
};

export function AppTextInput({
  label,
  style,
  secureTextEntry,
  centered = false,
  ...rest
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const showToggle = Boolean(secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            isFocused ? styles.inputFocused : null,
            centered ? styles.inputCentered : null,
            showToggle ? styles.inputWithToggle : null,
            style,
          ]}
          secureTextEntry={showToggle ? !isSecureVisible : secureTextEntry}
          onFocus={(event) => {
            setIsFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            rest.onBlur?.(event);
          }}
          autoCapitalize="none"
          {...rest}
        />
        {showToggle ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsSecureVisible((value) => !value)}
            style={styles.toggle}
          >
            <Feather
              name={isSecureVisible ? "eye-off" : "eye"}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  inputRow: {
    position: "relative",
  },
  input: {
    minHeight: 48,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputCentered: {
    textAlign: "center",
    letterSpacing: 6,
    fontSize: 20,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});
