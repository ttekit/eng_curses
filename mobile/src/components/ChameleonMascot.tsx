import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { colors } from "../theme/colors";

export type ChameleonMood = "happy" | "thinking" | "excited" | "waving";

type ChameleonMascotProps = {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: ChameleonMood;
  style?: ViewStyle;
};

const sizeMap = {
  sm: 36,
  md: 64,
  lg: 96,
  xl: 144,
} as const;

function render_brow(mood: ChameleonMood) {
  if (mood === "thinking") {
    return (
      <Path
        d="M40 65 L70 70"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (mood === "excited") {
    return (
      <>
        <Path
          d="M38 65 Q55 55 72 65"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={95} cy={50} r={3} fill={colors.primary} />
        <Circle cx={30} cy={55} r={2} fill={colors.primary} />
      </>
    );
  }
  return (
    <Path
      d="M40 68 Q55 62 70 68"
      stroke={colors.primary}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export function ChameleonMascot({
  size = "md",
  mood = "happy",
  style,
}: ChameleonMascotProps) {
  const dimension = sizeMap[size];
  return (
    <View style={[styles.wrap, { width: dimension, height: dimension }, style]}>
      <Svg width={dimension} height={dimension} viewBox="0 0 200 200">
        <Ellipse cx={100} cy={120} rx={55} ry={45} fill={colors.accent} />
        <Circle cx={75} cy={115} r={8} fill={`${colors.accent}99`} />
        <Circle cx={95} cy={130} r={6} fill={`${colors.accent}99`} />
        <Circle cx={120} cy={110} r={10} fill={`${colors.accent}99`} />
        <Path
          d="M155 130 Q180 130 185 155 Q190 180 165 185 Q145 188 145 170"
          stroke={colors.accent}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        <Ellipse cx={130} cy={155} rx={12} ry={8} fill={colors.accent} />
        <Rect x={125} y={155} width={10} height={20} rx={5} fill={colors.accent} />
        <Ellipse cx={70} cy={155} rx={12} ry={8} fill={colors.accent} />
        <Rect x={65} y={155} width={10} height={20} rx={5} fill={colors.accent} />
        <Ellipse cx={65} cy={85} rx={40} ry={35} fill={colors.accent} />
        <Path
          d="M40 60 Q50 40 65 55 Q80 40 90 60"
          stroke={colors.primary}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={55} cy={80} r={18} fill={colors.background} />
        <Circle cx={55} cy={80} r={14} fill={colors.text} />
        <Circle cx={52} cy={77} r={5} fill={colors.background} />
        {render_brow(mood)}
        <Path
          d="M30 95 Q40 105 55 100"
          stroke={`${colors.primary}B3`}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        {mood === "excited" ? (
          <Path
            d="M32 98 Q20 110 25 120"
            stroke={colors.destructive}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {mood === "waving" ? (
          <>
            <Ellipse cx={45} cy={145} rx={10} ry={7} fill={colors.accent} />
            <Rect x={35} y={120} width={10} height={25} rx={5} fill={colors.accent} />
            <Circle cx={40} cy={115} r={8} fill={colors.accent} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
