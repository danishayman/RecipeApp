/**
 * Free-text matching over a recipe.
 *
 * Kept in the data layer beside the other recipe rules rather than in the
 * hook, so what counts as a match is stated in one place and stays testable on
 * its own.
 */

import { recipeTypeLabel } from '@/data/recipe-catalog';
import type { Recipe } from '@/types/recipe';

/**
 * Folds a raw input into something comparable: trimmed, lowercased, and with
 * runs of whitespace collapsed so "tomato   soup" still matches.
 */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Every piece of text a search is allowed to look at. The category label is
 * included so "dessert" finds the brownies even though the recipe itself never
 * uses the word.
 */
function haystack(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.description,
    recipeTypeLabel(recipe.typeId),
    ...recipe.ingredients,
    ...recipe.steps,
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * True when `query` appears anywhere in the recipe's searchable text.
 *
 * An empty query matches everything, so callers can pass the raw field value
 * without special-casing the initial state.
 */
export function recipeMatchesQuery(recipe: Recipe, query: string): boolean {
  const needle = normalizeQuery(query);

  if (needle.length === 0) {
    return true;
  }

  return haystack(recipe).includes(needle);
}
