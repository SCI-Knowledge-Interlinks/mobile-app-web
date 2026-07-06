import React from "react";
import { StyleSheet, Text } from "react-native";

import { colors } from "../constants/colors";
import { fontFamily, getFontFamily, textPresets } from "../constants/typography";

const variantStyles = StyleSheet.create({
  thin: { fontFamily: fontFamily.thin },
  light: { fontFamily: fontFamily.light },
  regular: { fontFamily: fontFamily.regular },
  medium: { fontFamily: fontFamily.medium },
  bold: { fontFamily: fontFamily.bold },
  black: { fontFamily: fontFamily.black },
  condensedLight: { fontFamily: fontFamily.condensedLight },
  condensed: { fontFamily: fontFamily.condensed },
  condensedBold: { fontFamily: fontFamily.condensedBold },
});

/**
 * App-wide Text with Roboto variants.
 *
 * @example
 * <AppText variant="medium">Medium body</AppText>
 * <AppText weight="bold" condensed>Condensed bold</AppText>
 * <AppText preset="sectionTitle" style={{ color: colors.text }}>Section</AppText>
 */
export default function AppText({
  children,
  variant,
  weight,
  condensed = false,
  preset,
  style,
  color = colors.text,
  ...props
}) {
  const resolvedVariant = variant || weight || "regular";
  const fontStyle = condensed
    ? { fontFamily: getFontFamily(resolvedVariant, { condensed: true }) }
    : variantStyles[resolvedVariant] || variantStyles.regular;

  return (
    <Text
      style={[
        { color },
        preset ? textPresets[preset] : null,
        fontStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
