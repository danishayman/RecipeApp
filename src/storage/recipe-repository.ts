/**
 * Persistence for recipes.
 *
 * All reads and writes to device storage go through this class. It owns the
 * storage keys, the JSON encoding, first-launch seeding and the validation of
 * anything read back, so screens and hooks only ever see `Recipe[]`.
 */

import { SAMPLE_RECIPES } from '@/data/recipe-catalog';
import { parseRecipes } from '@/data/validation';
import { asyncStorageStore, type KeyValueStore } from '@/storage/key-value-store';
import type { Recipe } from '@/types/recipe';

/**
 * Storage keys are namespaced and versioned. Bumping the version is how a
 * future schema change would opt out of stale data rather than crash on it.
 */
const RECIPES_KEY = 'recipeapp:recipes:v1';
const SEEDED_KEY = 'recipeapp:seeded:v1';

/** Raised when device storage is unreadable or unwritable. */
export class RecipeStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'RecipeStorageError';
    this.cause = options?.cause;
  }
}

export class RecipeRepository {
  constructor(private readonly store: KeyValueStore = asyncStorageStore) {}

  /**
   * Returns every stored recipe, seeding the sample set on first launch.
   *
   * The seeded flag is deliberately separate from the recipe list: without it,
   * a user who deletes every recipe would have the samples reappear on the
   * next launch.
   *
   * @throws {RecipeStorageError} when the underlying store is unavailable.
   */
  async loadAll(): Promise<Recipe[]> {
    let seeded: string | null;
    let raw: string | null;

    try {
      [seeded, raw] = await Promise.all([
        this.store.getItem(SEEDED_KEY),
        this.store.getItem(RECIPES_KEY),
      ]);
    } catch (cause) {
      throw new RecipeStorageError('Could not read recipes from device storage.', { cause });
    }

    if (seeded !== 'true') {
      return this.seed();
    }

    return decodeRecipes(raw);
  }

  /**
   * Replaces the stored recipe list.
   *
   * @throws {RecipeStorageError} when the write fails.
   */
  async saveAll(recipes: Recipe[]): Promise<void> {
    try {
      await this.store.setItem(RECIPES_KEY, JSON.stringify(recipes));
    } catch (cause) {
      throw new RecipeStorageError('Could not save recipes to device storage.', { cause });
    }
  }

  /** Appends a recipe and returns the resulting list. */
  async add(recipe: Recipe): Promise<Recipe[]> {
    const next = [recipe, ...(await this.loadAll())];
    await this.saveAll(next);
    return next;
  }

  /**
   * Replaces the recipe sharing `recipe.id` and returns the resulting list.
   * A recipe that is no longer present is a no-op rather than an error, which
   * is the sensible outcome if it was deleted on another screen.
   */
  async update(recipe: Recipe): Promise<Recipe[]> {
    const current = await this.loadAll();
    const next = current.map((existing) => (existing.id === recipe.id ? recipe : existing));
    await this.saveAll(next);
    return next;
  }

  /** Removes the recipe with the given id and returns the resulting list. */
  async remove(recipeId: string): Promise<Recipe[]> {
    const current = await this.loadAll();
    const next = current.filter((existing) => existing.id !== recipeId);
    await this.saveAll(next);
    return next;
  }

  /** Restores the bundled sample recipes, discarding anything stored. */
  async reset(): Promise<Recipe[]> {
    return this.seed();
  }

  /** Writes the bundled samples and marks storage as seeded. */
  private async seed(): Promise<Recipe[]> {
    const samples = [...SAMPLE_RECIPES];

    try {
      await this.store.setItem(RECIPES_KEY, JSON.stringify(samples));
      await this.store.setItem(SEEDED_KEY, 'true');
    } catch (cause) {
      throw new RecipeStorageError('Could not seed the sample recipes.', { cause });
    }

    return samples;
  }
}

/**
 * Parses stored JSON into validated recipes.
 *
 * Corrupt or partially written data is treated as "nothing stored" rather than
 * as an error: the user keeps a working app, and the next write repairs the
 * record.
 */
function decodeRecipes(raw: string | null): Recipe[] {
  if (raw === null) return [];

  try {
    return parseRecipes(JSON.parse(raw));
  } catch {
    console.warn('[RecipeRepository] Stored recipes were not valid JSON; starting empty.');
    return [];
  }
}

/** The shared repository instance used by the app. */
export const recipeRepository = new RecipeRepository();
