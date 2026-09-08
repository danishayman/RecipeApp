import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { PermissionDeniedError, useImagePicker } from '@/hooks/use-image-picker';

interface PhotoFieldProps {
  label: string;
  /** Current photo URI, or `null` when the recipe has none. */
  value: string | null;
  onChange: (uri: string | null) => void;
  /** Chooses the placeholder emoji while no photo is set. */
  typeId: string;
}

/**
 * Photo picker for the recipe form.
 *
 * Presentational: permissions, launching the camera or library, and copying
 * the result into permanent storage all live in `useImagePicker`.
 */
export function PhotoField({ label, value, onChange, typeId }: PhotoFieldProps) {
  const handlePicked = useCallback((uri: string) => onChange(uri), [onChange]);

  const handleError = useCallback((error: Error) => {
    if (error instanceof PermissionDeniedError) {
      Alert.alert(
        error.source === 'camera' ? 'Camera unavailable' : 'Photos unavailable',
        error.message
      );
      return;
    }

    Alert.alert('Could not add that photo', 'Please try again.');
  }, []);

  const { pick, isPicking } = useImagePicker({ onPicked: handlePicked, onError: handleError });

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>

      <RecipeImage
        uri={value}
        typeId={typeId}
        emojiSize={56}
        style={styles.preview}
        accessibilityLabel={value === null ? 'No photo chosen yet' : 'Chosen recipe photo'}
      />

      <View style={styles.actions}>
        <AppButton
          label="Take photo"
          variant="secondary"
          onPress={() => pick('camera')}
          busy={isPicking}
          style={styles.action}
        />
        <AppButton
          label="Choose photo"
          variant="secondary"
          onPress={() => pick('library')}
          busy={isPicking}
          style={styles.action}
        />
      </View>

      {value === null ? null : (
        <AppButton
          label="Remove photo"
          variant="secondary"
          onPress={() => onChange(null)}
          style={styles.remove}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radii.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
  remove: {
    alignSelf: 'flex-start',
  },
});
