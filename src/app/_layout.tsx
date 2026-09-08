import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme } from 'react-native';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
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
            title: 'Recipes',
            headerLeft: () => <SignOutAction />,
            headerRight: () => <AddRecipeAction />,
          }}
        />
        <Stack.Screen name="add" options={{ title: 'New recipe' }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

/** Header action on the listing screen that opens the add form. */
function AddRecipeAction() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];

  return (
    <Pressable
      onPress={() => router.push('/add')}
      accessibilityRole="button"
      accessibilityLabel="Add a recipe"
      accessibilityHint="Opens the form for a new recipe"
      hitSlop={Spacing.two}
      style={({ pressed }) => [
        styles.headerAction,
        { backgroundColor: palette.accent, opacity: pressed ? 0.8 : 1 },
      ]}>
      <ThemedText type="label" style={{ color: palette.onAccent }}>
        + Add
      </ThemedText>
    </Pressable>
  );
}

/** Header action that ends the session, with a confirmation first. */
function SignOutAction() {
  const { signOut } = useAuth();

  const confirm = () => {
    Alert.alert('Sign out?', 'Your recipes stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut().catch(() => Alert.alert('Could not sign out', 'Please try again.'));
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={confirm}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      hitSlop={Spacing.two}
      style={({ pressed }) => [styles.headerText, { opacity: pressed ? 0.6 : 1 }]}>
      <ThemedText type="label" themeColor="textSecondary">
        Sign out
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
  },
  headerText: {
    paddingVertical: Spacing.one,
    paddingRight: Spacing.three,
  },
});
