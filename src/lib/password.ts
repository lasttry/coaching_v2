import { TextEncoder } from 'util';

/**
 * Helper to encode a string as Uint8Array
 * @param {string} text - The text to encode
 * @returns {Uint8Array} - The encoded text as Uint8Array
 */
function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Helper to hash a password with salt using Web Crypto API
 * @param {string} password - The password to hash
 * @param {string} [salt] - The salt to use for hashing
 * @returns {Promise<string>} - The hashed password in the format `${salt}:${hashedPassword}`
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
  if (!salt) {
    salt = generateSalt();
  }
  const passwordData = encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashedPassword = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `${salt}:${hashedPassword}`;
}

/**
 * Helper to generate a random salt
 * @param {number} [length=16] - The length of the salt
 * @returns {string} - The generated salt
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Helper to determine if a password is hashed or clear text and return parts
 * @param {string} password - The password to parse
 * @returns {{ salt: string; hashedPassword: string } | null} - The parsed salt and hashed password, or null if invalid
 */
export function parseHashedPassword(
  password: string
): { salt: string; hashedPassword: string } | null {
  const parts = password.split(':');
  if (parts.length !== 2) {
    return null;
  }
  const hashedPasswordPattern = /^[a-f0-9]{64}$/i;
  if (!hashedPasswordPattern.test(parts[1])) {
    return null;
  }
  return { salt: parts[0], hashedPassword: parts[1] };
}

/**
 * Helper to validate a clear text password against a stored hashed password
 * @param {string} clearPassword - The clear text password to validate
 * @param {string} storedPassword - The stored hashed password to validate against
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise
 */
export async function validatePassword(
  clearPassword: string,
  storedPassword: string
): Promise<boolean> {
  const parsedPassword = parseHashedPassword(storedPassword);
  if (!parsedPassword) {
    console.error('Stored password format is invalid');
    return false;
  }
  const hashedPassword = await hashPassword(clearPassword, parsedPassword.salt);
  return hashedPassword === storedPassword;
}
