import { useMemo, useState } from 'react';

import { recipeMatchesQuery } from '@/data/recipe-search';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { ALL_TYPES, type Recipe } from '@/types/recipe';

export interface RecipeFilterState {
  /** The selected category id, or the ALL_TYPES sentinel. */
  typeFilter: string;
  setTypeFilter: (typeId: string) => void;
  /** The free-text search term, exactly as typed. */
  query: string;
  setQuery: (query: string) => void;
  /** True when either the category or the search is narrowing the list. */
  isNarrowed: boolean;
  /** True when a search term is active, whatever the category. */
  hasQuery: boolean;
  /** `recipes` narrowed by both the category and the search. */
  visibleRecipes: Recipe[];
  /** Pluralised summary of what is shown, e.g. "3 recipes in Soup". */
  summary: string;
  /** True when nothing matches, so the caller can pick the right empty copy. */
  isEmpty: boolean;
}

/**
 * Narrowing a recipe collection, by category and by free text.
 *
 * Both live here rather than on the screen because they are one question -
 * "which recipes am I looking at?" - and because the list and its summary have
 * to answer it identically. Deriving both from the same `useMemo` is what stops
 * the count from disagreeing with the rows beneath it.
 *
 * The state is screen-local rather than in the shared provider: it is a view
 * preference, and two screens over the same collection should be free to
 * narrow it differently.
 */
export function useRecipeFilter(recipes: Recipe[]): RecipeFilterState {
  const { labelFor } = useRecipeTypes();
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [query, setQuery] = useState('');

  const visibleRecipes = useMemo<Recipe[]>(
    () =>
      recipes.filter(
        (recipe) =>
          (typeFilter === ALL_TYPES || recipe.typeId === typeFilter) &&
          recipeMatchesQuery(recipe, query)
      ),
    [recipes, typeFilter, query]
  );

  const hasQuery = query.trim().length > 0;
  const isFiltered = typeFilter !== ALL_TYPES;

  const summary = useMemo(() => {
    const count = visibleRecipes.length;
    const noun = count === 1 ? 'recipe' : 'recipes';
    const scope = isFiltered ? ` in ${labelFor(typeFilter)}` : '';
    const matching = hasQuery ? ` matching “${query.trim()}”` : '';

    return `${count} ${noun}${scope}${matching}`;
  }, [visibleRecipes.length, isFiltered, typeFilter, labelFor, hasQuery, query]);

  return {
    typeFilter,
    setTypeFilter,
    query,
    setQuery,
    isNarrowed: isFiltered || hasQuery,
    hasQuery,
    visibleRecipes,
    summary,
    isEmpty: visibleRecipes.length === 0,
  };
}
