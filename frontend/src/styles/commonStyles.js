import { Platform, StyleSheet } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...textPresets.screenTitle,
    color: colors.text,
    fontSize: 24,
  },
  subtitle: {
    ...textPresets.caption,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4,
  },
  webInputReset: Platform.select({
    web: {
      outlineColor: "transparent",
      outlineStyle: "none",
      outlineWidth: 0,
    },
    default: {},
  }),

  /** New design system — screen shells */
  newScreen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  newScreenAlt: {
    flex: 1,
    backgroundColor: colors.pageBackgroundAlt,
  },
  newScreenSoft: {
    flex: 1,
    backgroundColor: colors.pageBackgroundSoft,
  },
  newScreenContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  newScrollContent: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  bannerWrap: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: spacing.md,
  },
  cardShadow: {
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardShadowMd: {
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyState: {
    ...textPresets.emptyState,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  loadingCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

/** Safe-area bottom padding for scroll content */
export function scrollBottomPadding(insets, extra = spacing.lg) {
  return insets.bottom + extra;
}
