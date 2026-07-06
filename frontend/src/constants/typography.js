/**
 * Roboto font family names — loaded in app/_layout.js via useAppFonts.
 * Use these keys in StyleSheet or via the AppText component.
 */
export const fontFamily = {
  thin: "Roboto_100Thin",
  light: "Roboto_300Light",
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  bold: "Roboto_700Bold",
  black: "Roboto_900Black",
  condensedLight: "RobotoCondensed_300Light",
  condensed: "RobotoCondensed_400Regular",
  condensedBold: "RobotoCondensed_700Bold",
};

/** Default font for the whole app */
export const defaultFontFamily = fontFamily.regular;

/**
 * Map semantic weight names to Roboto (or Roboto Condensed) family.
 * @param {"thin"|"light"|"regular"|"medium"|"bold"|"black"} weight
 * @param {{ condensed?: boolean }} options
 */
export function getFontFamily(weight = "regular", options = {}) {
  const { condensed = false } = options;

  if (condensed) {
    if (weight === "light" || weight === "thin") return fontFamily.condensedLight;
    if (weight === "bold" || weight === "black") return fontFamily.condensedBold;
    return fontFamily.condensed;
  }

  return fontFamily[weight] || fontFamily.regular;
}

/** Reusable text presets — combine with your own color/spacing as needed */
export const textPresets = {
  screenTitle: {
    fontFamily: fontFamily.black,
    fontSize: 23,
    lineHeight: 30,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 21,
  },
  caption: {
    fontFamily: fontFamily.light,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    lineHeight: 24,
  },
  labelCondensed: {
    fontFamily: fontFamily.condensedBold,
    fontSize: 12,
    lineHeight: 16,
  },

  /** New design system — headers & info cards */
  pageHeaderTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  pageHeaderTitleLeft: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  infoHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  infoHeadingSmall: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 22,
  },
  infoBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  infoSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  cardLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  galleryCardTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  emptyState: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  outlineButton: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  profileName: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  listItemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  listItemMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  hubItemLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  },
};
