/**
 * Domain model for the app.
 *
 * `RecipeType` mirrors an entry in `src/data/recipetypes.json` and `Recipe`
 * mirrors an entry in `src/data/sample-recipes.json`. Both JSON files are
 * validated against these shapes at load time (see `src/data/validation.ts`),
 * so nothing downstream has to defend against malformed data.
 */

/** A recipe category such as "Dessert". Drives the Picker on list and form screens. */
export interface RecipeType {
  /** Stable slug used as the foreign key on `Recipe.typeId`. */
  readonly id: string;
  /** Human-readable name shown in the Picker and on cards. */
  readonly label: string;
  /** Single emoji used as a lightweight icon and image placeholder. */
  readonly emoji: string;
  /** One-line explanation of the category. */
  readonly description: string;
}

/** A single recipe, whether seeded from JSON or created by the user. */
export interface Recipe {
  /** Unique identifier. Seeded recipes use a `seed-` prefix. */
  id: string;
  title: string;
  /** References `RecipeType.id`. */
  typeId: string;
  /** Short blurb shown on the card and above the ingredients. */
  description: string;
  /**
   * Either a remote `https://` URL (seeded recipes) or a local file URI
   * returned by the image picker. `null` when the recipe has no photo, in
   * which case the UI falls back to a placeholder derived from the type.
   */
  imageUri: string | null;
  /** How many people the recipe serves. Always >= 1. */
  servings: number;
  /** Total hands-on plus cooking time in minutes. Always >= 0. */
  prepMinutes: number;
  /** Ordered list of ingredients, one per line. Never empty. */
  ingredients: string[];
  /** Ordered list of method steps, one per line. Never empty. */
  steps: string[];
  /** ISO-8601 timestamp of creation. */
  createdAt: string;
  /** ISO-8601 timestamp of the last edit. Equals `createdAt` until first edit. */
  updatedAt: string;
}

/**
 * The user-editable subset of a `Recipe`. The add and edit forms produce a
 * draft; the data layer attaches the identity and timestamp fields.
 */
export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;

/** Sentinel used by the list filter to mean "do not filter by type". */
export const ALL_TYPES = 'all';

/** Either the "all" sentinel or a concrete `RecipeType.id`. */
export type RecipeTypeFilter = typeof ALL_TYPES | RecipeType['id'];
