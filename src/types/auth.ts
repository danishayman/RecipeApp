/**
 * Domain model for authentication.
 *
 * Note what is absent: there is no password field anywhere in these types.
 * A password is accepted as an argument, hashed, and discarded; only the salt
 * and the resulting digest are ever persisted.
 */

/** A stored account. */
export interface Credential {
  username: string;
  /** Hex-encoded random salt, generated once per account. */
  salt: string;
  /** Hex-encoded SHA-256 digest of `salt + password`. */
  hash: string;
  /** ISO-8601 timestamp of when the account was created. */
  createdAt: string;
}

/**
 * An active sign-in. The brief asks for the session to persist until logout,
 * so this deliberately carries no expiry.
 */
export interface Session {
  username: string;
  /** Random identifier for this sign-in, regenerated on every login. */
  token: string;
  /** ISO-8601 timestamp of when the session began. */
  signedInAt: string;
}
