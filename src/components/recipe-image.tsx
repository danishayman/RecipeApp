import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { recipeTypeEmoji } from '@/data/recipe-catalog';
import { useTheme } from '@/hooks/use-theme';

interface RecipeImageProps {
  /** Remote URL, local file URI, or `null` when the recipe has no photo. */
  uri: string | null;
  /** Used to pick the placeholder emoji when there is no usable image. */
  typeId: string;
  /** Sizing for the frame. The photo fills it and is clipped to its corners. */
  style?: StyleProp<ViewStyle>;
  /** Font size of the placeholder emoji. Scale it with the container. */
  emojiSize?: number;
  accessibilityLabel?: string;
}

/**
 * A recipe photo that always renders something.
 *
 * Seeded recipes point at remote URLs, so a device with no network would
 * otherwise show an empty box. Both "no photo" and "photo failed to load"
 * fall back to a tinted tile carrying the category emoji.
 *
 * The photo is absolutely positioned inside a plain View so callers can size
 * the frame with ordinary view styles rather than image styles.
 */
export function RecipeImage({
  uri,
  typeId,
  style,
  emojiSize = 40,
  accessibilityLabel,
}: RecipeImageProps) {
  const theme = useTheme();

  // Remember which uri failed rather than a bare boolean. A new uri then
  // deserves a fresh attempt for free, where a boolean would have to be reset
  // in an effect and would keep showing the previous failure until it ran.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const showPlaceholder = uri === null || failedUri === uri;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabel ?? (showPlaceholder ? 'No photo for this recipe' : 'Recipe photo')
      }
      style={[
        styles.frame,
        { backgroundColor: showPlaceholder ? theme.backgroundSelected : theme.backgroundElement },
        style,
      ]}>
      {showPlaceholder ? (
        <ThemedText style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.2 }}>
          {recipeTypeEmoji(typeId)}
        </ThemedText>
      ) : (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFailedUri(uri)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
