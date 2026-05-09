import { StyleSheet } from "react-native";

import { colors } from "../constants/colors";
import { layout } from "../constants/layout";
import { spacing } from "../constants/spacing";

export const topSectionStyles = StyleSheet.create({
  topSection: {
    backgroundColor: colors.topSection,
    paddingHorizontal: layout.topSectionHorizontalPadding,
    paddingBottom: layout.topSectionBottomPadding,
  },
  topInner: {
    width: "100%",
    alignSelf: "center",
  },
  topBar: {
    minHeight: layout.topBarHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginHorizontal: layout.topBarHorizontalMargin,
    marginBottom: layout.topBarBottomMargin,
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: layout.topTitleGap,
  },
  backButton: {
    width: layout.topBackButtonWidth,
    height: layout.topBackButtonHeight,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  screenTitle: {
    flex: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: layout.topTitleFontSize,
    lineHeight: layout.topTitleLineHeight,
    fontWeight: "900",
    textAlign: "left",
  },
  actionButton: {
    width: layout.topActionButtonSize,
    height: layout.topActionButtonSize,
    borderRadius: layout.topActionButtonRadius,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
