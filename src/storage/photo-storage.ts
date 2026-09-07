/**
 * Durable storage for recipe photos.
 *
 * The image picker hands back a URI inside the app's *cache* directory, which
 * the operating system is free to purge. Copying the file into the document
 * directory is what makes a recipe's photo survive a restart alongside the
 * recipe record itself.
 */

import { Directory, File, Paths } from 'expo-file-system';

const PHOTO_DIRECTORY_NAME = 'recipe-photos';

/** Returns the photo directory, creating it on first use. */
function photosDirectory(): Directory {
  const directory = new Directory(Paths.document, PHOTO_DIRECTORY_NAME);

  if (!directory.exists) {
    directory.create({ intermediates: true });
  }

  return directory;
}

/** Best-effort file extension for a picked image, defaulting to jpg. */
function extensionFor(uri: string): string {
  const match = /\.([a-zA-Z0-9]{3,4})(?:\?|$)/.exec(uri);
  return match === null ? 'jpg' : match[1].toLowerCase();
}

/** True for photos this module owns, as opposed to bundled remote URLs. */
export function isManagedPhoto(uri: string | null): boolean {
  return uri !== null && uri.includes(`/${PHOTO_DIRECTORY_NAME}/`);
}

/**
 * Copies a freshly picked image into permanent storage.
 *
 * Remote URLs (the seeded recipes) are returned untouched. If the copy fails
 * the original URI is returned rather than throwing: a photo that might later
 * disappear beats losing the user's recipe on save.
 */
export function persistPhoto(sourceUri: string): string {
  if (!sourceUri.startsWith('file://')) {
    return sourceUri;
  }

  try {
    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(sourceUri)}`;
    const destination = new File(photosDirectory(), name);

    new File(sourceUri).copy(destination);

    return destination.uri;
  } catch (cause) {
    console.warn('[photo-storage] Could not copy the photo into permanent storage.', cause);
    return sourceUri;
  }
}

/**
 * Deletes a photo this module owns. Anything else (a remote seed URL, a
 * cache URI) is left alone. Never throws - a missing file is not a problem
 * worth interrupting a delete for.
 */
export function deletePhoto(uri: string | null): void {
  if (!isManagedPhoto(uri) || uri === null) {
    return;
  }

  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch (cause) {
    console.warn('[photo-storage] Could not delete a recipe photo.', cause);
  }
}
