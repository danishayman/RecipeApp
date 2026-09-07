/**
 * Application state for the recipe collection.
 *
 * A single provider owns the list so that the listing, add and detail screens
 * all read the same array and a mutation on one screen is visible on the
 * others immediately, without a refetch on focus. The repository stays the
 * source of truth on disk; this is the in-memory mirror of it.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { applyDraft, createRecipe } from '@/data/recipe-factory';
import { recipeRepository } from '@/storage/recipe-repository';
import type { Recipe, RecipeDraft } from '@/types/recipe';

/** Lifecycle of the initial load from device storage. */
export type RecipesStatus = 'loading' | 'ready' | 'error';

interface RecipesContextValue {
  recipes: Recipe[];
  status: RecipesStatus;
  /** Human-readable message when `status` is `error`, otherwise `null`. */
  error: string | null;
  /** Re-reads the collection from storage. Used by the error retry action. */
  reload: () => Promise<void>;
  /** Persists a new recipe and returns the stored record. */
  addRecipe: (draft: RecipeDraft) => Promise<Recipe>;
  /** Persists edits to an existing recipe and returns the stored record. */
  updateRecipe: (recipeId: string, draft: RecipeDraft) => Promise<Recipe>;
  /** Removes a recipe from storage. */
  deleteRecipe: (recipeId: string) => Promise<void>;
  /** Finds a recipe already held in memory. */
  getRecipe: (recipeId: string) => Recipe | undefined;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

function messageFor(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong. Please try again.';
}

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<RecipesStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      setRecipes(await recipeRepository.loadAll());
      setStatus('ready');
    } catch (cause) {
      setError(messageFor(cause));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addRecipe = useCallback(async (draft: RecipeDraft) => {
    const recipe = createRecipe(draft);
    setRecipes(await recipeRepository.add(recipe));
    return recipe;
  }, []);

  const updateRecipe = useCallback(
    async (recipeId: string, draft: RecipeDraft) => {
      const existing = recipes.find((candidate) => candidate.id === recipeId);

      if (existing === undefined) {
        throw new Error('That recipe no longer exists.');
      }

      const updated = applyDraft(existing, draft);
      setRecipes(await recipeRepository.update(updated));
      return updated;
    },
    [recipes]
  );

  const deleteRecipe = useCallback(async (recipeId: string) => {
    setRecipes(await recipeRepository.remove(recipeId));
  }, []);

  const getRecipe = useCallback(
    (recipeId: string) => recipes.find((candidate) => candidate.id === recipeId),
    [recipes]
  );

  const value = useMemo<RecipesContextValue>(
    () => ({
      recipes,
      status,
      error,
      reload,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipe,
    }),
    [recipes, status, error, reload, addRecipe, updateRecipe, deleteRecipe, getRecipe]
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

/**
 * Access to the recipe collection.
 *
 * @throws when called outside `RecipesProvider`, which is a wiring mistake
 * rather than a runtime condition worth handling.
 */
export function useRecipes(): RecipesContextValue {
  const value = useContext(RecipesContext);

  if (value === null) {
    throw new Error('useRecipes must be used inside a RecipesProvider.');
  }

  return value;
}
