import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
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
          <Stack.Screen
            name="index"
            options={{ title: 'Recipes', headerRight: () => <AddRecipeAction /> }}
          />
          <Stack.Screen name="add" options={{ title: 'New recipe' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
        </Stack>
      </RecipesProvider>
    </ThemeProvider>
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
      <ThemedText type="smallBold" style={{ color: palette.onAccent }}>
        + Add
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
  },
});
