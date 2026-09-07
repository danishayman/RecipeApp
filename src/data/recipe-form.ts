/**
 * The shape the recipe form edits, and the rules it enforces.
 *
 * Numeric fields live as strings while the user is typing - a half-typed
 * number is not a number - and are converted once, on submit. Keeping that
 * conversion and the validation rules here leaves the form component
 * responsible only for rendering.
 */

import { RECIPE_TYPES } from '@/data/recipe-catalog';
import { compactLines } from '@/data/recipe-factory';
import type { Recipe, RecipeDraft } from '@/types/recipe';

/** Editable values as held by the form's inputs. */
export interface RecipeFormValues {
  title: string;
  typeId: string;
  description: string;
  imageUri: string | null;
  servings: string;
  prepMinutes: string;
  ingredients: string[];
  steps: string[];
}

/** Validation messages, keyed by field. Absent keys are valid. */
export type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>;

/** A blank form, pre-selecting the first category from recipetypes.json. */
export function emptyFormValues(): RecipeFormValues {
  return {
    title: '',
    typeId: RECIPE_TYPES[0]?.id ?? '',
    description: '',
    imageUri: null,
    servings: '2',
    prepMinutes: '30',
    ingredients: [''],
    steps: [''],
  };
}

/** Pre-fills the form from an existing recipe, for the edit flow. */
export function formValuesFrom(recipe: Recipe): RecipeFormValues {
  return {
    title: recipe.title,
    typeId: recipe.typeId,
    description: recipe.description,
    imageUri: recipe.imageUri,
    servings: String(recipe.servings),
    prepMinutes: String(recipe.prepMinutes),
    ingredients: recipe.ingredients.length > 0 ? [...recipe.ingredients] : [''],
    steps: recipe.steps.length > 0 ? [...recipe.steps] : [''],
  };
}

/** Parses a whole number from a form field, or `null` when it is not one. */
function parseCount(value: string): number | null {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number.parseInt(trimmed, 10);
}

/**
 * Checks the form against the rules a stored recipe must satisfy.
 * Returns an empty object when the values are ready to submit.
 */
export function validateFormValues(values: RecipeFormValues): RecipeFormErrors {
  const errors: RecipeFormErrors = {};

  if (values.title.trim().length === 0) {
    errors.title = 'Give the recipe a name.';
  }

  if (values.typeId.trim().length === 0) {
    errors.typeId = 'Choose a type.';
  }

  const servings = parseCount(values.servings);
  if (servings === null || servings < 1) {
    errors.servings = 'Enter a whole number of servings, at least 1.';
  }

  const prepMinutes = parseCount(values.prepMinutes);
  if (prepMinutes === null) {
    errors.prepMinutes = 'Enter the time in whole minutes.';
  }

  if (compactLines(values.ingredients).length === 0) {
    errors.ingredients = 'Add at least one ingredient.';
  }

  if (compactLines(values.steps).length === 0) {
    errors.steps = 'Add at least one step.';
  }

  return errors;
}

/** True when `validateFormValues` found nothing to report. */
export function isValid(errors: RecipeFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Converts validated form values into a draft the data layer can store.
 * Call only after `validateFormValues` returns no errors.
 */
export function toRecipeDraft(values: RecipeFormValues): RecipeDraft {
  return {
    title: values.title.trim(),
    typeId: values.typeId,
    description: values.description.trim(),
    imageUri: values.imageUri,
    servings: parseCount(values.servings) ?? 1,
    prepMinutes: parseCount(values.prepMinutes) ?? 0,
    ingredients: compactLines(values.ingredients),
    steps: compactLines(values.steps),
  };
}
