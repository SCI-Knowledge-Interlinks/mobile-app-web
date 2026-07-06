import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MobileAppShell from "../src/components/MobileAppShell";
import EventJourneyPathTracker from "../src/components/EventJourneyPathTracker";
import { SPLASH_BACKGROUND_COLOR } from "../src/screens/SplashScreen";
import { useAppFonts } from "../src/hooks/useAppFonts";
import { usePushNotifications } from "../src/hooks/usePushNotifications";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  usePushNotifications({ enabled: true });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: SPLASH_BACKGROUND_COLOR }} />;
  }

  return (
    <SafeAreaProvider>
      <MobileAppShell>
      <EventJourneyPathTracker />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in-mobile" />
        <Stack.Screen name="sign-in-email" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="login-success" />
        <Stack.Screen name="home-new" />
        <Stack.Screen name="event-info" />
        <Stack.Screen name="contact-us" />
        <Stack.Screen name="event-journey" />
        <Stack.Screen name="exhibitor-new" />
        <Stack.Screen name="awards" />
        <Stack.Screen name="b2b-partnering" />
        <Stack.Screen name="floor-plan" />
        <Stack.Screen name="boci-partner" />
        <Stack.Screen name="gallery" />
        <Stack.Screen name="my-badge" />
        <Stack.Screen name="badge-scanner" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="partners-new" />
        <Stack.Screen name="conference-list" />
        <Stack.Screen name="exhibitor-info" />
        <Stack.Screen name="partner-info" />
        <Stack.Screen name="speakers" />
        <Stack.Screen name="dignitaries" />
        <Stack.Screen name="speaker-info" />
        <Stack.Screen name="session-details-new" />
      </Stack>
      </MobileAppShell>
    </SafeAreaProvider>
  );
}
