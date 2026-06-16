import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export type SkillScore = {
  name: string;
  value: number;
};

type SkillBarsProps = {
  skills: readonly SkillScore[];
};

export function SkillBars({ skills }: SkillBarsProps) {
  return (
    <View style={styles.wrap}>
      {skills.map((skill) => {
        const value = Math.max(0, Math.min(100, skill.value));
        return (
          <View key={skill.name} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.name}>{skill.name}</Text>
              <Text style={styles.value}>{value}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${value}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  row: {
    gap: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    ...typography.caption,
    color: colors.text,
    fontSize: 12,
  },
  value: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
