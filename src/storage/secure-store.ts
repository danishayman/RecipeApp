import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { asyncStorageStore, type KeyValueStore } from '@/storage/key-value-store';

/**
 * A `KeyValueStore` backed by the operating system's secure storage: the
 * Android Keystore and the iOS Keychain, both of which encrypt at rest and
 * keep values out of ordinary app backups.
 *
 * This is the swap the `KeyValueStore` interface was written for - the auth
 * repository is built exactly like the recipe repository and simply receives a
 * different store.
 *
 * SecureStore has no web implementation. Rather than crash the web build this
 * falls back to AsyncStorage there and says so loudly: on web the values are
 * *not* encrypted. The app is mobile-first and the caveat is documented in the
 * README; a real web deployment would keep the session in an HTTP-only cookie
 * set by a server instead.
 */
export const secureKeyValueStore: KeyValueStore = Platform.select<KeyValueStore>({
  web: unencryptedWebFallback(),
  default: {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
});

function unencryptedWebFallback(): KeyValueStore {
  if (Platform.OS === 'web') {
    console.warn(
      '[secure-store] SecureStore is unavailable on web; credentials are stored unencrypted.'
    );
  }

  return asyncStorageStore;
}
