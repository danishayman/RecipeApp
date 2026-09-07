import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface EmptyStateProps {
  /** A single emoji used as the illustration. */
  emoji: string;
  title: string;
  message: string;
  /** Optional call to action, such as a button. */
  action?: ReactNode;
}

/** Shown wherever a list has nothing to display, so the screen is never blank. */
export function EmptyState({ emoji, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="smallBold" style={styles.centered}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        {message}
      </ThemedText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 58,
  },
  centered: {
    textAlign: 'center',
  },
});
