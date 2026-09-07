/**
 * Runtime validation for recipe data.
 *
 * Data reaches the app from two places that TypeScript cannot vouch for:
 * bundled JSON files and whatever JSON was previously written to device
 * storage. Both are parsed through these guards so a corrupt or partially
 * written record is dropped rather than crashing a screen further down.
 */

import type { Recipe, RecipeType } from '@/types/recipe';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Narrows an unknown value to a `RecipeType`. */
export function isRecipeType(value: unknown): value is RecipeType {
  if (!isObject(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.emoji) &&
    typeof value.description === 'string'
  );
}

/** Narrows an unknown value to a `Recipe`. */
export function isRecipe(value: unknown): value is Recipe {
  if (!isObject(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.typeId) &&
    typeof value.description === 'string' &&
    (value.imageUri === null || isNonEmptyString(value.imageUri)) &&
    isFiniteNumber(value.servings) &&
    isFiniteNumber(value.prepMinutes) &&
    isNonEmptyStringArray(value.ingredients) &&
    isNonEmptyStringArray(value.steps) &&
    isNonEmptyString(value.createdAt) &&
    isNonEmptyString(value.updatedAt)
  );
}

/**
 * Keeps only the well-formed entries of an unknown array.
 *
 * Returns an empty array when `value` is not an array at all, so callers can
 * treat "storage was empty" and "storage was garbage" identically.
 */
export function parseRecipeTypes(value: unknown): RecipeType[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecipeType);
}

/** Array counterpart of `isRecipe`. See `parseRecipeTypes`. */
export function parseRecipes(value: unknown): Recipe[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecipe);
}
