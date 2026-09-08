/**
 * The shape the login screen edits, and the rules it enforces.
 *
 * Split from the component for the same reason `recipe-form.ts` is: the screen
 * renders, this decides what counts as valid.
 */

/** What the user is trying to do on the login screen. */
export type AuthMode = 'sign-in' | 'register';

export interface AuthFormValues {
  username: string;
  password: string;
}

/** Validation messages, keyed by field. Absent keys are valid. */
export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

/** Shortest password accepted when creating an account. */
export const MIN_PASSWORD_LENGTH = 8;

export function emptyAuthValues(): AuthFormValues {
  return { username: '', password: '' };
}

/**
 * Checks the form.
 *
 * The length rule applies only when registering. Signing in must accept
 * whatever was previously registered, and a "too short" message on a sign-in
 * form would tell an attacker something about the stored password.
 */
export function validateAuthValues(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (values.username.trim().length === 0) {
    errors.username = 'Enter a username.';
  }

  if (values.password.length === 0) {
    errors.password = 'Enter a password.';
  } else if (mode === 'register' && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

/** True when `validateAuthValues` found nothing to report. */
export function isAuthFormValid(errors: AuthFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
