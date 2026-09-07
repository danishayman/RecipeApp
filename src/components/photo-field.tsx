import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { persistPhoto } from '@/storage/photo-storage';

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
 * Offers the camera and the photo library, and copies whatever is chosen into
 * permanent storage so the photo outlives the cache directory.
 */
export function PhotoField({ label, value, onChange, typeId }: PhotoFieldProps) {
  const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [isPicking, setIsPicking] = useState(false);

  /** Runs a picker, guarding it with the permission it needs. */
  const pick = async (source: 'camera' | 'library') => {
    if (isPicking) return;
    setIsPicking(true);

    try {
      const granted =
        source === 'camera'
          ? (cameraPermission?.granted ?? false) || (await requestCameraPermission()).granted
          : (libraryPermission?.granted ?? false) || (await requestLibraryPermission()).granted;

      if (!granted) {
        Alert.alert(
          source === 'camera' ? 'Camera unavailable' : 'Photos unavailable',
          `RecipeApp needs permission to use your ${
            source === 'camera' ? 'camera' : 'photo library'
          }. You can grant it in Settings.`
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      const asset = result.canceled ? undefined : result.assets?.[0];

      if (asset !== undefined) {
        onChange(persistPhoto(asset.uri));
      }
    } catch (cause) {
      console.warn('[PhotoField] Picking a photo failed.', cause);
      Alert.alert('Could not add that photo', 'Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
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
          onPress={() => void pick('camera')}
          busy={isPicking}
          style={styles.action}
        />
        <AppButton
          label="Choose photo"
          variant="secondary"
          onPress={() => void pick('library')}
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
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
