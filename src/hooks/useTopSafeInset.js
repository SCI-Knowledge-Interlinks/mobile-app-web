import { Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useTopSafeInset() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    return Math.max(insets.top, StatusBar.currentHeight ?? 0);
  }

  return insets.top;
}
