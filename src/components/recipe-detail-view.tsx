import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { useLayout } from '@/hooks/use-layout';
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

            <View style={styles.metaRow}>
              <View style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {recipeTypeLabel(recipe.typeId)}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {recipe.prepMinutes} min · serves {recipe.servings}
              </ThemedText>
            </View>

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
                  <ThemedText type="smallBold" themeColor="textSecondary">
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
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
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
    borderRadius: Radii.large,
  },
  headingBlock: {
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.pill,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
