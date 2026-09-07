import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { formValuesFrom } from '@/data/recipe-form';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-provider';
import type { Recipe, RecipeDraft } from '@/types/recipe';

/**
 * Recipe detail screen.
 *
 * Reads the recipe named by the `id` route parameter and shows its photo,
 * ingredients and method. An edit toggle swaps in the same form the add
 * screen uses, so every field is editable. Saving updates storage in place;
 * deleting removes the recipe and returns to the listing.
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRecipe, updateRecipe, deleteRecipe, status } = useRecipes();
  const [isEditing, setIsEditing] = useState(false);

  const recipe = typeof id === 'string' ? getRecipe(id) : undefined;

  const goBack = () => {
    // Guard against a deep link that opened this screen with nothing beneath it.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  // Covers a stale deep link, and the instant just after a delete.
  if (recipe === undefined) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          emoji="🔍"
          title="Recipe not found"
          message="It may have been deleted."
          action={<AppButton label="Back to recipes" onPress={goBack} />}
        />
      </ThemedView>
    );
  }

  const handleSave = async (draft: RecipeDraft) => {
    await updateRecipe(recipe.id, draft);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete this recipe?', `${recipe.title} will be removed for good.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteRecipe(recipe.id)
            .then(goBack)
            .catch(() => Alert.alert('Could not delete', 'Please try again.'));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: isEditing ? 'Edit recipe' : recipe.title }} />

      {isEditing ? (
        <RecipeForm
          initialValues={formValuesFrom(recipe)}
          submitLabel="Save changes"
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <RecipeDetailView
          recipe={recipe}
          onEdit={() => setIsEditing(true)}
          onDelete={confirmDelete}
        />
      )}
    </ThemedView>
  );
}

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Read-only presentation of a recipe.
 *
 * On a wide landscape window the photo sits beside the text rather than above
 * it, so the method is readable without scrolling past a full-width image.
 */
function RecipeDetailView({ recipe, onEdit, onDelete }: RecipeDetailViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isWide, isLandscape } = useLayout();
  const isSplit = isWide && isLandscape;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
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

/** A titled block of detail content. */
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
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
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
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
