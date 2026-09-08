import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Read-only presentation of a recipe.
 *
 * Purely presentational: the route above it owns the recipe, the edit toggle
 * and the delete confirmation.
 *
 * On a wide landscape window the photo sits beside the text rather than above
 * it, so the method is readable without scrolling past a full-width image.
 */
export function RecipeDetailView({ recipe, onEdit, onDelete }: RecipeDetailViewProps) {
  const theme = useTheme();
  const { labelFor } = useRecipeTypes();
  const insets = useSafeAreaInsets();
  const { isWide, isLandscape } = useLayout();
  const isSplit = isWide && isLandscape;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        // Keep the action row clear of the home indicator or navigation bar.
        { paddingBottom: insets.bottom + Spacing.four },
        isSplit && styles.contentWide,
      ]}>
      <View style={isSplit ? styles.split : styles.stack}>
        <View style={isSplit ? styles.splitMedia : undefined}>
          <RecipeImage
            uri={recipe.imageUri}
            typeId={recipe.typeId}
            emojiSize={72}
            style={styles.hero}
            accessibilityLabel={`Photo of ${recipe.title}`}
          />
        </View>

        <View style={[styles.stack, isSplit && styles.splitText]}>
          <View style={styles.headingBlock}>
            <ThemedText type="subtitle">{recipe.title}</ThemedText>

            <ThemedText type="meta" themeColor="textSecondary">
              {labelFor(recipe.typeId)} · {recipe.prepMinutes} min · serves {recipe.servings}
            </ThemedText>

            {recipe.description.length > 0 ? (
              <ThemedText themeColor="textSecondary">{recipe.description}</ThemedText>
            ) : null}
          </View>

          <DetailSection title="Ingredients">
            {recipe.ingredients.map((ingredient, index) => (
              <View key={`${index}-${ingredient}`} style={styles.listRow}>
                <ThemedText themeColor="textSecondary">•</ThemedText>
                <ThemedText style={styles.growingText}>{ingredient}</ThemedText>
              </View>
            ))}
          </DetailSection>

          <DetailSection title="Method">
            {recipe.steps.map((step, index) => (
              <View key={`${index}-${step}`} style={styles.listRow}>
                <View style={[styles.ordinal, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="meta" themeColor="textSecondary">
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText style={styles.growingText}>{step}</ThemedText>
              </View>
            ))}
          </DetailSection>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Edit recipe"
          onPress={onEdit}
          style={styles.growingText}
          accessibilityHint="Makes every field editable"
        />
        <AppButton
          label="Delete"
          variant="danger"
          onPress={onDelete}
          accessibilityHint="Removes this recipe permanently"
        />
      </View>
    </ScrollView>
  );
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled block of detail content. */
function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="label" themeColor="textSecondary">
        {title}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.four,
  },
  contentWide: {
    maxWidth: MaxContentWidth + 200,
  },
  stack: {
    gap: Spacing.four,
    flex: 1,
  },
  split: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  splitMedia: {
    flex: 2,
  },
  splitText: {
    flex: 3,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radii.small,
  },
  headingBlock: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  ordinal: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growingText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
