import { useMemo } from 'react';

import {
  findRecipeType,
  RECIPE_TYPES,
  recipeTypeEmoji,
  recipeTypeLabel,
} from '@/data/recipe-catalog';
import type { RecipeType } from '@/types/recipe';

export interface RecipeTypesApi {
  /** Every selectable category, in the order declared in recipetypes.json. */
  types: readonly RecipeType[];
  /** Looks up a category, or `undefined` for an unknown id. */
  findType: (typeId: string) => RecipeType | undefined;
  /** Display label for a category, with a readable fallback. */
  labelFor: (typeId: string) => string;
  /** Emoji for a category, with a neutral fallback. */
  emojiFor: (typeId: string) => string;
}

/**
 * Access to the recipe categories.
 *
 * Every screen that shows or filters by a category goes through this rather
 * than importing the catalog module directly. That keeps the dependency
 * pointing one way - UI to hook to data - and gives the app a single seam to
 * change if the categories ever come from somewhere other than a bundled JSON
 * file.
 *
 * The returned object is memoised on a static catalog, so its identity is
 * stable for the life of the component and safe to use in dependency arrays.
 */
export function useRecipeTypes(): RecipeTypesApi {
  return useMemo(
    () => ({
      types: RECIPE_TYPES,
      findType: findRecipeType,
      labelFor: recipeTypeLabel,
      emojiFor: recipeTypeEmoji,
    }),
    []
  );
}
