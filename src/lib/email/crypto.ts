import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * AES-256-GCM helpers for encrypting small secrets (e.g. SMTP passwords).
 *
 * The encryption key is read from the `EMAIL_ENCRYPTION_KEY` environment variable
 * and must be a 32-byte value encoded as hex (64 chars) or base64. Generate with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * Stored format: `v1:<iv_b64>:<ciphertext_b64>:<authTag_b64>`
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const STORAGE_VERSION = 'v1';

function getKey(): Buffer {
  const raw = process.env.EMAIL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'EMAIL_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and set it in .env.'
    );
  }

  // Accept hex (64 chars) or base64 (44 chars incl. padding).
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    key = Buffer.from(raw, 'base64');
  }

  if (key.length !== 32) {
    throw new Error(`EMAIL_ENCRYPTION_KEY must decode to 32 bytes; got ${key.length} bytes.`);
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    STORAGE_VERSION,
    iv.toString('base64'),
    ciphertext.toString('base64'),
    authTag.toString('base64'),
  ].join(':');
}

export function decryptSecret(encoded: string): string {
  const key = getKey();
  const parts = encoded.split(':');
  if (parts.length !== 4 || parts[0] !== STORAGE_VERSION) {
    throw new Error('Invalid encrypted secret format');
  }
  const [, ivB64, ctB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

/**
 * Returns true if the provided string looks like an encrypted secret produced by this module.
 * Useful for conditionally calling `decryptSecret` on potentially-plain values.
 */
export function isEncryptedSecret(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith(`${STORAGE_VERSION}:`);
}
