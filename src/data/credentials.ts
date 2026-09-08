/**
 * Password hashing and credential validation.
 *
 * The rule this module exists to enforce: a password is accepted, hashed, and
 * discarded. It is never stored, never logged, and never leaves this file in
 * readable form.
 *
 * ## On the choice of hash
 *
 * Each account gets a random 16-byte salt, and what is stored is
 * `SHA-256(salt + password)`. The salt means two accounts with the same
 * password produce different digests, so one leaked digest says nothing about
 * any other account.
 *
 * SHA-256 is nonetheless a *fast* hash, which is the wrong property for
 * password storage: an attacker holding the digest can try candidates very
 * quickly. Real password storage belongs on a server using a deliberately slow
 * KDF - bcrypt, scrypt or Argon2. `expo-crypto` exposes no KDF, and iterating
 * `digestStringAsync` enough times to matter would mean thousands of async
 * native calls, which is far too slow to run on a sign-in.
 *
 * This is a local, offline demo with no server, and the digest lives in
 * hardware-backed secure storage rather than in a database that might leak. The
 * scheme is appropriate for that and is not presented as production-grade.
 */

import * as Crypto from 'expo-crypto';

import type { Credential, Session } from '@/types/auth';

const SALT_BYTES = 16;

/** Renders bytes as lowercase hex, so salts and digests store as plain text. */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Hashes a password against a salt. The only place a password is read. */
async function hashPassword(salt: string, password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}${password}`);
}

/** Usernames are compared case-insensitively and without surrounding space. */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Builds a storable account record. The password is not part of the result. */
export async function createCredential(username: string, password: string): Promise<Credential> {
  const salt = toHex(await Crypto.getRandomBytesAsync(SALT_BYTES));

  return {
    username: normalizeUsername(username),
    salt,
    hash: await hashPassword(salt, password),
    createdAt: new Date().toISOString(),
  };
}

/**
 * True when `password` is the one this credential was created from.
 *
 * Re-hashes with the stored salt and compares digests; the stored digest is
 * never reversed, because it cannot be.
 */
export async function verifyPassword(credential: Credential, password: string): Promise<boolean> {
  return (await hashPassword(credential.salt, password)) === credential.hash;
}

/** Mints a session for an authenticated account. */
export function createSession(username: string): Session {
  return {
    username: normalizeUsername(username),
    token: Crypto.randomUUID(),
    signedInAt: new Date().toISOString(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Narrows an unknown value read back from storage to a `Credential`. */
export function isCredential(value: unknown): value is Credential {
  if (!isObject(value)) return false;

  return (
    isNonEmptyString(value.username) &&
    isNonEmptyString(value.salt) &&
    isNonEmptyString(value.hash) &&
    isNonEmptyString(value.createdAt)
  );
}

/** Narrows an unknown value read back from storage to a `Session`. */
export function isSession(value: unknown): value is Session {
  if (!isObject(value)) return false;

  return (
    isNonEmptyString(value.username) &&
    isNonEmptyString(value.token) &&
    isNonEmptyString(value.signedInAt)
  );
}
