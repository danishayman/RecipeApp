import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncCallbackOptions {
  /** Called when the action rejects, with the thrown value normalised to an Error. */
  onError?: (error: Error) => void;
}

export interface AsyncCallback<Args extends unknown[], Result> {
  /** Runs the action. Ignored while a previous run is still in flight. */
  run: (...args: Args) => Promise<Result | undefined>;
  /** True from the moment `run` is called until the action settles. */
  isPending: boolean;
  /** The last error, or null. Cleared at the start of each run. */
  error: Error | null;
}

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

/**
 * Runs an async action while tracking its pending and error state.
 *
 * Two things in this app need exactly this: saving a recipe from the form and
 * picking a photo. Both showed a spinner, swallowed the rejection into an
 * alert and had to avoid double-submission, which was duplicated try/finally
 * plumbing in each component.
 *
 * The effect here exists to synchronise with something outside React - the
 * component's own lifetime. Its cleanup marks the component unmounted so a
 * slow action that settles after the user has navigated away does not try to
 * set state on a component that is gone. The in-flight guard is a ref rather
 * than state so that re-entrancy is blocked immediately, without waiting for
 * a re-render.
 */
export function useAsyncCallback<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  options: UseAsyncCallbackOptions = {}
): AsyncCallback<Args, Result> {
  const { onError } = options;

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);
  const isRunning = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args: Args): Promise<Result | undefined> => {
      if (isRunning.current) {
        return undefined;
      }

      isRunning.current = true;
      setIsPending(true);
      setError(null);

      try {
        return await action(...args);
      } catch (cause) {
        const failure = toError(cause);

        if (isMounted.current) {
          setError(failure);
        }

        onError?.(failure);
        return undefined;
      } finally {
        isRunning.current = false;

        if (isMounted.current) {
          setIsPending(false);
        }
      }
    },
    [action, onError]
  );

  return { run, isPending, error };
}
