/**
 * FileIdentityService
 *
 * LIMITATION: The current Adobe UXP runtime (Premiere Pro 25.6+) exposes
 * `crypto.getRandomValues()` and `crypto.randomUUID()` but does NOT provide
 * `crypto.subtle.digest()` (Web Crypto SubtleCrypto). There is no built-in
 * mechanism to compute SHA-256 or any other cryptographic digest.
 *
 * Reading large binary files (video, audio) into an ArrayBuffer purely to
 * run a JavaScript-side hash is memory-prohibitive for typical media assets.
 *
 * Therefore:
 * - This service CANNOT produce a true content-identity checksum.
 * - The `contentIdentityAvailable` flag is always `false`.
 * - Duplicate detection uses name + type + size heuristics only.
 * - No value produced by this service should be treated as proof that two
 *   files have identical content.
 * - Users must explicitly confirm when a potential duplicate is detected.
 *
 * Future: If Adobe exposes a native host-side checksum API or
 * `crypto.subtle.digest()`, replace the implementation here.
 */

export interface FileIdentityResult {
  /** Always false until a real digest API becomes available. */
  readonly contentIdentityAvailable: false;
  /** A descriptive fingerprint (name + size) for display purposes only. NOT a checksum. */
  readonly fingerprint: string;
}

export class FileIdentityService {
  /** Whether true content-based identity (e.g. SHA-256) is supported. */
  readonly contentIdentityAvailable = false as const;

  /**
   * Produces a NON-CRYPTOGRAPHIC fingerprint for UI display only.
   * This MUST NOT be used to claim two files are identical.
   */
  fingerprint(name: string, size?: number): FileIdentityResult {
    const sizePart = size !== undefined ? `-${size}b` : "";
    return {
      contentIdentityAvailable: false,
      fingerprint: `${name}${sizePart}`,
    };
  }
}

export const fileIdentityService = new FileIdentityService();
