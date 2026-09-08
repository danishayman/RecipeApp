import { useMemo, useState } from 'react';

import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { ALL_TYPES, type Recipe } from '@/types/recipe';

export interface RecipeFilterState {
  /** The selected category id, or the ALL_TYPES sentinel. */
  typeFilter: string;
  setTypeFilter: (typeId: string) => void;
  /** `recipes` narrowed to the selected category. */
  visibleRecipes: Recipe[];
  /** Pluralised summary of what is currently shown, e.g. "3 recipes in Soup". */
  summary: string;
  /** True when nothing matches, so the caller can pick the right empty copy. */
  isEmpty: boolean;
}

/**
 * Filtering a recipe collection by category.
 *
 * The filter is deliberately screen-local state rather than part of the
 * shared provider: it is a view preference, and two screens showing the same
 * collection should be free to narrow it differently.
 *
 * Both the filtered list and its summary are derived with `useMemo` from the
 * collection and the selection, so they cannot drift from each other the way
 * a separately stored count would.
 */
export function useRecipeFilter(recipes: Recipe[]): RecipeFilterState {
  const { labelFor } = useRecipeTypes();
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const visibleRecipes = useMemo<Recipe[]>(
    () =>
      typeFilter === ALL_TYPES ? recipes : recipes.filter((recipe) => recipe.typeId === typeFilter),
    [recipes, typeFilter]
  );

  const summary = useMemo(() => {
    const count = visibleRecipes.length;
    const noun = count === 1 ? 'recipe' : 'recipes';

    return typeFilter === ALL_TYPES
      ? `${count} ${noun}`
      : `${count} ${noun} in ${labelFor(typeFilter)}`;
  }, [visibleRecipes.length, typeFilter, labelFor]);

  return {
    typeFilter,
    setTypeFilter,
    visibleRecipes,
    summary,
    isEmpty: visibleRecipes.length === 0,
  };
}
