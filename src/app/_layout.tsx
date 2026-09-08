import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { Colors, Fonts } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/state/auth-provider';
import { RecipesProvider } from '@/state/recipes-provider';

// Hold the splash screen until the session has been restored, so an already
// signed-in user never sees a flash of the login screen. Failures here are
// non-fatal (the splash auto-hides).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Catches render errors anywhere below the root layout, so a single bad
 * record shows a recoverable screen instead of a white screen of death.
 */
export { AppErrorBoundary as ErrorBoundary };

/**
 * Root of the app. The providers sit above the navigator so the auth guard can
 * read the session, and every screen shares one recipe collection.
 */
export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <RecipesProvider>
          <RootNavigator />
        </RecipesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * The navigator, split out so it can read the session.
 *
 * `Stack.Protected` hides a group of routes when its guard is false. Signing
 * out flips `isSignedIn`, the app routes disappear, and expo-router falls back
 * to the only screen left - which is why nothing here has to navigate by hand.
 */
function RootNavigator() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];
  const { status, isSignedIn } = useAuth();

  useEffect(() => {
    if (status === 'ready') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [status]);

  // Rendering nothing while the session is read keeps the splash in place and
  // stops the guard from briefly resolving to "signed out".
  if (status === 'loading') {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.accent,
        headerTitleStyle: {
          color: palette.text,
          // The serif is what makes a screen title read as a heading in this
          // design rather than as chrome.
          fontFamily: Fonts.serif,
          fontSize: 22,
          fontWeight: '400',
        },
        contentStyle: { backgroundColor: palette.background },
      }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen
          name="index"
          options={{
            // The listing owns its masthead so the product mark, title and
            // actions read as one editorial block rather than system chrome.
            headerShown: false,
          }}
        />
        <Stack.Screen name="add" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
