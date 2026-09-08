import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { EmptyState } from '@/components/empty-state';
import { RecipeDetailView } from '@/components/recipe-detail-view';
import { RecipeForm } from '@/components/recipe-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formValuesFrom } from '@/data/recipe-form';
import { useRecipes } from '@/state/recipes-provider';
import type { RecipeDraft } from '@/types/recipe';

/** Recovers this screen alone, leaving the listing beneath it intact. */
export { AppErrorBoundary as ErrorBoundary };

/**
 * Recipe detail screen.
 *
 * Owns the recipe lookup, the edit toggle and the delete confirmation, and
 * hands the rendering to `RecipeDetailView` or, in edit mode, to the same
 * `RecipeForm` the add screen uses - so every field is editable and the two
 * screens cannot drift apart.
 *
 * Every hook runs before the early returns below, so the order stays the same
 * on every render whether or not the recipe was found.
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRecipe, updateRecipe, deleteRecipe, status } = useRecipes();
  const [isEditing, setIsEditing] = useState(false);

  const recipeId = typeof id === 'string' ? id : undefined;
  const recipe = recipeId === undefined ? undefined : getRecipe(recipeId);

  const goBack = useCallback(() => {
    // Guard against a deep link that opened this screen with nothing beneath it.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleSave = useCallback(
    async (draft: RecipeDraft) => {
      if (recipeId === undefined) {
        return;
      }

      await updateRecipe(recipeId, draft);
      setIsEditing(false);
    },
    [updateRecipe, recipeId]
  );

  const confirmDelete = useCallback(() => {
    if (recipe === undefined) {
      return;
    }

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
  }, [recipe, deleteRecipe, goBack]);

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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: isEditing ? 'Edit recipe' : recipe.title }} />

      {isEditing ? (
        <RecipeForm
          initialValues={formValuesFrom(recipe)}
          submitLabel="Save changes"
          title="Edit recipe"
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <RecipeDetailView
          recipe={recipe}
          onEdit={() => setIsEditing(true)}
          onDelete={confirmDelete}
          onBack={goBack}
        />
      )}
    </ThemedView>
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
});
