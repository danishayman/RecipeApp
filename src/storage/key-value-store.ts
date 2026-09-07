/**
 * The narrow slice of AsyncStorage the app actually uses.
 *
 * Depending on this interface rather than on AsyncStorage directly keeps the
 * repository testable with an in-memory double and means swapping the backing
 * store (SQLite, SecureStore) would touch one file.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** The production store: `@react-native-async-storage/async-storage`. */
export const asyncStorageStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** An in-memory store, used by tests and as a fallback in development. */
export class InMemoryStore implements KeyValueStore {
  private readonly entries = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.entries.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.entries.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.entries.delete(key);
  }
}
