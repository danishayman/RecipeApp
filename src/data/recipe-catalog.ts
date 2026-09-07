/**
 * The bundled catalog: recipe types and the pre-populated sample recipes.
 *
 * `recipetypes.json` is the single source of truth for the categories offered
 * by the Picker on every screen. The seed recipes are validated against it at
 * module load, so a seed referencing a type that no longer exists is dropped
 * instead of rendering an unlabelled card.
 */

import recipeTypesJson from '@/data/recipetypes.json';
import sampleRecipesJson from '@/data/sample-recipes.json';
import { parseRecipes, parseRecipeTypes } from '@/data/validation';
import type { Recipe, RecipeType } from '@/types/recipe';

/** Every selectable recipe category, in the order declared in the JSON file. */
export const RECIPE_TYPES: readonly RecipeType[] = Object.freeze(
  parseRecipeTypes(recipeTypesJson.types)
);

const KNOWN_TYPE_IDS = new Set(RECIPE_TYPES.map((type) => type.id));

/**
 * The recipes shipped with the app. Used to seed device storage on first
 * launch; after that, storage is the source of truth.
 */
export const SAMPLE_RECIPES: readonly Recipe[] = Object.freeze(
  parseRecipes(sampleRecipesJson.recipes).filter((recipe) => KNOWN_TYPE_IDS.has(recipe.typeId))
);

/** Looks up a category by id. Returns `undefined` for an unknown id. */
export function findRecipeType(typeId: string): RecipeType | undefined {
  return RECIPE_TYPES.find((type) => type.id === typeId);
}

/**
 * The label to show for a recipe's category. Falls back to a readable string
 * rather than an empty gap if the recipe somehow points at a missing type.
 */
export function recipeTypeLabel(typeId: string): string {
  return findRecipeType(typeId)?.label ?? 'Uncategorised';
}

/** The emoji to show for a recipe's category, with a neutral fallback. */
export function recipeTypeEmoji(typeId: string): string {
  return findRecipeType(typeId)?.emoji ?? '🍽️';
}
