import { Platform, useWindowDimensions } from "react-native";

import { MOBILE_MAX_WIDTH } from "../constants/layout";

export function useAppContentWidth(horizontalPadding = 12) {
  const { width } = useWindowDimensions();
  const maxWidth = Platform.OS === "web" ? MOBILE_MAX_WIDTH : 760;

  return Math.min(width - horizontalPadding, maxWidth - horizontalPadding);
}

export function getAppContentWidth(windowWidth, horizontalPadding = 12) {
  const maxWidth = Platform.OS === "web" ? MOBILE_MAX_WIDTH : 760;

  return Math.min(windowWidth - horizontalPadding, maxWidth - horizontalPadding);
}

export function useTwoColumnCardWidth(gridPadding = 16, gap = 12) {
  const contentWidth = useAppContentWidth(gridPadding * 2);
  const cardWidth = (contentWidth - gap) / 2;

  return { contentWidth, cardWidth };
}
