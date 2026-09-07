import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { RecipesProvider } from '@/state/recipes-provider';

// Hold the splash screen until the first screen has mounted so the user never
// sees a blank frame. Failures here are non-fatal (the splash auto-hides).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Root navigator. A single native stack drives the whole app:
 * list -> add, and list -> detail.
 */
export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RecipesProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.background },
            headerTintColor: palette.accent,
            headerTitleStyle: { color: palette.text },
            contentStyle: { backgroundColor: palette.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'Recipes' }} />
        </Stack>
      </RecipesProvider>
    </ThemeProvider>
  );
}
