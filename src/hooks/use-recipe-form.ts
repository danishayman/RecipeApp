import { useCallback, useMemo, useState } from 'react';

import {
  isValid,
  toRecipeDraft,
  validateFormValues,
  type RecipeFormErrors,
  type RecipeFormValues,
} from '@/data/recipe-form';
import { useAsyncCallback } from '@/hooks/use-async-callback';
import type { RecipeDraft } from '@/types/recipe';

interface UseRecipeFormOptions {
  /** Starting values. Blank for the add screen, pre-filled for the edit screen. */
  initialValues: RecipeFormValues;
  /** Persists the completed draft. Rejections surface through `onError`. */
  onSubmit: (draft: RecipeDraft) => Promise<void>;
  /** Called when saving fails, so the screen can show an alert. */
  onError?: (error: Error) => void;
}

export interface RecipeFormState {
  values: RecipeFormValues;
  /** Empty until the first submit attempt, then live as the user types. */
  errors: RecipeFormErrors;
  /** True while the draft is being saved. */
  isSaving: boolean;
  /** Updates one field, preserving the rest. */
  setField: <Field extends keyof RecipeFormValues>(
    field: Field,
    value: RecipeFormValues[Field]
  ) => void;
  /** Validates and, if the form is complete, saves it. */
  submit: () => void;
}

/**
 * All of the state behind the recipe editor.
 *
 * Extracting it leaves `RecipeForm` responsible only for rendering, and means
 * the add screen and the detail screen's edit mode share not just the same
 * markup but the same rules and the same submit behaviour.
 *
 * Errors are derived from the current values rather than stored alongside
 * them. Keeping them as state would mean re-validating in an effect - or,
 * worse, inside a state updater - every time a field changed; as a `useMemo`
 * they simply cannot fall out of step with what the user has typed.
 */
export function useRecipeForm({
  initialValues,
  onSubmit,
  onError,
}: UseRecipeFormOptions): RecipeFormState {
  const [values, setValues] = useState<RecipeFormValues>(initialValues);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Stay quiet until the user has actually tried to submit, so nobody is
  // scolded about fields they have not reached yet.
  const errors = useMemo<RecipeFormErrors>(
    () => (hasSubmitted ? validateFormValues(values) : {}),
    [hasSubmitted, values]
  );

  const setField = useCallback(
    <Field extends keyof RecipeFormValues>(field: Field, value: RecipeFormValues[Field]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const { run: save, isPending: isSaving } = useAsyncCallback(onSubmit, { onError });

  const submit = useCallback(() => {
    setHasSubmitted(true);

    const found = validateFormValues(values);

    if (!isValid(found)) {
      return;
    }

    void save(toRecipeDraft(values));
  }, [values, save]);

  return { values, errors, isSaving, setField, submit };
}
