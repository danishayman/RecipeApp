/**
 * Turns user-supplied drafts into complete `Recipe` records.
 *
 * Identity and timestamps are owned by the data layer, never by a form, so
 * that the add and edit screens only ever deal with the editable fields.
 */

import type { Recipe, RecipeDraft } from '@/types/recipe';

/**
 * Generates a collision-resistant id without pulling in a UUID dependency.
 * A millisecond timestamp plus 40 bits of randomness is ample for a
 * single-device recipe list, and the leading timestamp keeps ids sortable.
 */
function generateRecipeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `recipe-${timestamp}-${random}`;
}

/** Removes blank entries and trims whitespace from a list of form rows. */
export function compactLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter((line) => line.length > 0);
}

/** Normalises a draft so stored recipes never carry stray whitespace. */
function normalizeDraft(draft: RecipeDraft): RecipeDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    ingredients: compactLines(draft.ingredients),
    steps: compactLines(draft.steps),
    servings: Math.max(1, Math.round(draft.servings)),
    prepMinutes: Math.max(0, Math.round(draft.prepMinutes)),
  };
}

/** Builds a brand new recipe from a draft. */
export function createRecipe(draft: RecipeDraft): Recipe {
  const now = new Date().toISOString();

  return {
    ...normalizeDraft(draft),
    id: generateRecipeId(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Applies an edited draft to an existing recipe, preserving its id and
 * creation time and stamping a fresh `updatedAt`.
 */
export function applyDraft(recipe: Recipe, draft: RecipeDraft): Recipe {
  return {
    ...normalizeDraft(draft),
    id: recipe.id,
    createdAt: recipe.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

/** The draft fields of an existing recipe, for pre-filling the edit form. */
export function toDraft(recipe: Recipe): RecipeDraft {
  return {
    title: recipe.title,
    typeId: recipe.typeId,
    description: recipe.description,
    imageUri: recipe.imageUri,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    ingredients: [...recipe.ingredients],
    steps: [...recipe.steps],
  };
}
