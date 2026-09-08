/**
 * Persistence for accounts and the active session.
 *
 * Built exactly like `RecipeRepository` - it owns the keys, the JSON encoding
 * and the validation of anything read back - but receives the SecureStore
 * implementation of `KeyValueStore` instead of the AsyncStorage one, so
 * credentials land in the Android Keystore or the iOS Keychain rather than in
 * ordinary app storage.
 */

import { createCredential, isCredential, isSession, normalizeUsername } from '@/data/credentials';
import type { KeyValueStore } from '@/storage/key-value-store';
import { secureKeyValueStore } from '@/storage/secure-store';
import type { Credential, Session } from '@/types/auth';

/**
 * Dots rather than the colons the recipe repository uses: SecureStore only
 * accepts keys matching /^[\w.-]+$/, so a colon throws at runtime.
 */
const ACCOUNTS_KEY = 'yumbook.auth.accounts.v1';
const SESSION_KEY = 'yumbook.auth.session.v1';
const SEEDED_KEY = 'yumbook.auth.seeded.v1';

/**
 * The account created on first launch so the app can be signed into without
 * registering first. The password is hashed on seeding like any other; it is
 * a literal here only because it is published in the README.
 */
export const DEMO_USERNAME = 'demo';
export const DEMO_PASSWORD = 'recipes123';

/** Raised when secure storage is unreadable or unwritable. */
export class AuthStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'AuthStorageError';
    this.cause = options?.cause;
  }
}

/** Raised when a username is already taken. */
export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`The username "${username}" is already registered on this device.`);
    this.name = 'UsernameTakenError';
  }
}

export class AuthRepository {
  constructor(private readonly store: KeyValueStore = secureKeyValueStore) {}

  /**
   * Every account on this device, seeding the demo account on first launch.
   *
   * The seeded flag is separate from the account list for the same reason the
   * recipe repository keeps its own: without it, deleting the demo account
   * would simply recreate it on the next launch.
   *
   * @throws {AuthStorageError} when secure storage is unavailable.
   */
  async loadAccounts(): Promise<Credential[]> {
    let seeded: string | null;
    let raw: string | null;

    try {
      [seeded, raw] = await Promise.all([
        this.store.getItem(SEEDED_KEY),
        this.store.getItem(ACCOUNTS_KEY),
      ]);
    } catch (cause) {
      throw new AuthStorageError('Could not read accounts from secure storage.', { cause });
    }

    if (seeded !== 'true') {
      return this.seed();
    }

    return decodeAccounts(raw);
  }

  /** Finds an account by username, case-insensitively. */
  async findAccount(username: string): Promise<Credential | undefined> {
    const wanted = normalizeUsername(username);
    return (await this.loadAccounts()).find((account) => account.username === wanted);
  }

  /**
   * Registers a new account.
   *
   * @throws {UsernameTakenError} when the username already exists.
   * @throws {AuthStorageError} when the write fails.
   */
  async register(username: string, password: string): Promise<Credential> {
    const accounts = await this.loadAccounts();
    const wanted = normalizeUsername(username);

    if (accounts.some((account) => account.username === wanted)) {
      throw new UsernameTakenError(wanted);
    }

    const credential = await createCredential(username, password);
    await this.saveAccounts([...accounts, credential]);

    return credential;
  }

  /** Reads the persisted session, or null when signed out. */
  async loadSession(): Promise<Session | null> {
    let raw: string | null;

    try {
      raw = await this.store.getItem(SESSION_KEY);
    } catch (cause) {
      throw new AuthStorageError('Could not read the session from secure storage.', { cause });
    }

    return decodeSession(raw);
  }

  /** Persists a session so it survives a restart. */
  async saveSession(session: Session): Promise<void> {
    try {
      await this.store.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (cause) {
      throw new AuthStorageError('Could not save the session to secure storage.', { cause });
    }
  }

  /** Ends the session. Accounts are left untouched. */
  async clearSession(): Promise<void> {
    try {
      await this.store.removeItem(SESSION_KEY);
    } catch (cause) {
      throw new AuthStorageError('Could not clear the session.', { cause });
    }
  }

  private async saveAccounts(accounts: Credential[]): Promise<void> {
    try {
      await this.store.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (cause) {
      throw new AuthStorageError('Could not save accounts to secure storage.', { cause });
    }
  }

  /** Writes the demo account and marks storage as seeded. */
  private async seed(): Promise<Credential[]> {
    const accounts = [await createCredential(DEMO_USERNAME, DEMO_PASSWORD)];

    try {
      await this.store.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      await this.store.setItem(SEEDED_KEY, 'true');
    } catch (cause) {
      throw new AuthStorageError('Could not create the demo account.', { cause });
    }

    return accounts;
  }
}

/**
 * Parses stored accounts. Corrupt data is treated as "nothing stored" rather
 * than as an error, matching how stored recipes are handled: the user keeps a
 * working app and the next write repairs the record.
 */
function decodeAccounts(raw: string | null): Credential[] {
  if (raw === null) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCredential) : [];
  } catch {
    console.warn('[AuthRepository] Stored accounts were not valid JSON; starting empty.');
    return [];
  }
}

/** Parses the stored session, treating anything malformed as signed out. */
function decodeSession(raw: string | null): Session | null {
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    console.warn('[AuthRepository] The stored session was not valid JSON; signing out.');
    return null;
  }
}

/** The shared repository instance used by the app. */
export const authRepository = new AuthRepository();
