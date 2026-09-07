import type { ErrorBoundaryProps } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Fallback shown when a screen throws while rendering.
 *
 * Routes export this as `ErrorBoundary`, which expo-router wraps around the
 * screen. The point is that one bad record cannot take the whole app down: the
 * user gets an explanation and a retry that re-renders the route.
 *
 * It deliberately depends on nothing but the colour scheme, so it can still
 * paint itself when the failure came from application state.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyState
          emoji="😵"
          title="Something went wrong"
          message="This screen could not be displayed. You can try again, or go back and carry on."
          action={<AppButton label="Try again" onPress={() => void retry()} />}
        />

        {/* The message is for the developer, so keep it visually quiet. */}
        <ThemedView
          type="backgroundElement"
          style={[styles.details, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {error.message}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  details: {
    padding: Spacing.three,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
