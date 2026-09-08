/**
 * Application state for the signed-in user.
 *
 * Mirrors `RecipesProvider`: one provider owns the session, restores it from
 * secure storage on mount, and exposes the operations that change it. The
 * repository stays the source of truth on disk; this is the in-memory mirror.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { createSession, verifyPassword } from '@/data/credentials';
import { authRepository } from '@/storage/auth-repository';
import type { Session } from '@/types/auth';

/** Lifecycle of restoring the session from secure storage. */
export type AuthStatus = 'loading' | 'ready';

/** Raised when a username or password does not match. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('That username and password do not match.');
    this.name = 'InvalidCredentialsError';
  }
}

interface AuthContextValue {
  /** The active session, or null when signed out. */
  session: Session | null;
  /** False until the persisted session has been read back. */
  status: AuthStatus;
  /** True once a session has been restored or created. */
  isSignedIn: boolean;
  /**
   * Verifies credentials and starts a session.
   *
   * @throws {InvalidCredentialsError} when they do not match.
   */
  signIn: (username: string, password: string) => Promise<void>;
  /**
   * Creates an account and signs straight into it.
   *
   * @throws {UsernameTakenError} when the username already exists.
   */
  register: (username: string, password: string) => Promise<void>;
  /** Ends the session. Accounts and recipes are left untouched. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  /**
   * Restores any persisted session. A failure here is not surfaced as an error
   * screen: an unreadable session simply means signed out, which the login
   * screen already handles.
   */
  const restore = useCallback(async () => {
    try {
      setSession(await authRepository.loadSession());
    } catch (cause) {
      console.warn('[AuthProvider] Could not restore the session.', cause);
    } finally {
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    // Reading secure storage is external-system synchronisation, which is what
    // an effect is for. Every setState inside `restore` runs after an await, so
    // none of them fire synchronously from here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
  }, [restore]);

  const signIn = useCallback(async (username: string, password: string) => {
    const account = await authRepository.findAccount(username);

    // Verify even when the account is missing would leak which usernames
    // exist through timing; with a local store that is academic, so the
    // simpler branch is used and the message stays deliberately vague.
    if (account === undefined || !(await verifyPassword(account, password))) {
      throw new InvalidCredentialsError();
    }

    const next = createSession(account.username);
    await authRepository.saveSession(next);
    setSession(next);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const account = await authRepository.register(username, password);
    const next = createSession(account.username);
    await authRepository.saveSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    await authRepository.clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      isSignedIn: session !== null,
      signIn,
      register,
      signOut,
    }),
    [session, status, signIn, register, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access to the signed-in user.
 *
 * @throws when called outside `AuthProvider`, which is a wiring mistake rather
 * than a runtime condition worth handling.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (value === null) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return value;
}
