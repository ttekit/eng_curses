/**
 * Typography presets using Inter (body) and Space Grotesk (display).
 * Do not set fontWeight when fontFamily is a weight-specific Expo font file.
 */
export const fontFamilies = {
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  display: "SpaceGrotesk_700Bold",
  displayMedium: "SpaceGrotesk_500Medium",
} as const;

export const typography = {
  displayTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    lineHeight: 38,
  },
  sectionTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;
