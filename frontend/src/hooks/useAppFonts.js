import { useFonts } from "expo-font";
import {
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import {
  RobotoCondensed_300Light,
  RobotoCondensed_400Regular,
  RobotoCondensed_700Bold,
} from "@expo-google-fonts/roboto-condensed";

export function useAppFonts() {
  return useFonts({
    Roboto_100Thin,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
    RobotoCondensed_300Light,
    RobotoCondensed_400Regular,
    RobotoCondensed_700Bold,
  });
}
