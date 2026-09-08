import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { RecipeForm } from '@/components/recipe-form';
import { ThemedView } from '@/components/themed-view';
import { emptyFormValues } from '@/data/recipe-form';
import { useRecipes } from '@/state/recipes-provider';
import type { RecipeDraft } from '@/types/recipe';

/**
 * Add Recipe screen.
 *
 * A thin wrapper around the shared form: it supplies blank values, persists
 * the result and returns to the listing, which is already showing the new
 * recipe because both screens read the same provider.
 */
export default function AddRecipeScreen() {
  const router = useRouter();
  const { addRecipe } = useRecipes();

  const goBack = useCallback(() => {
    // Guard against a deep link that opened this screen with nothing beneath it.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = useCallback(
    async (draft: RecipeDraft) => {
      await addRecipe(draft);
      goBack();
    },
    [addRecipe, goBack]
  );

  return (
    <ThemedView style={styles.container}>
      <RecipeForm
        initialValues={emptyFormValues()}
        submitLabel="Save recipe"
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
