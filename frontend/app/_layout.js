import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="speakers" />
        <Stack.Screen name="my-calendar" />
        <Stack.Screen name="speaker-info" />
        <Stack.Screen name="session-details" />
        <Stack.Screen name="session-filter" />
      </Stack>
    </SafeAreaProvider>
  );
}
