import type { PasswordAlphabetOptions } from './types.js';

/**
 * Built-in alphabet presets
 */
export const alphabets = {
  /**
   * Standard Base64 alphabet (RFC 4648)
   * 64 characters: A-Za-z0-9+/
   */
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  
  /**
   * URL-safe Base64 alphabet (RFC 4648 §5)
   * 64 characters: A-Za-z0-9-_ (replaces +/ with -_)
   */
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  
  /**
   * Hexadecimal alphabet
   * 16 characters: 0-9a-f
   */
  hex: '0123456789abcdef',
  
  /**
   * Alphanumeric alphabet (uppercase + lowercase + digits)
   * 62 characters
   */
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  
  /**
   * Lowercase alphanumeric alphabet
   * 36 characters: a-z0-9
   */
  alphanumericLower: 'abcdefghijklmnopqrstuvwxyz0123456789',
  
  /**
   * Numeric only
   * 10 characters: 0-9
   */
  numeric: '0123456789',
  
  /**
   * Password-safe alphabet
   * 57 characters: A-Za-z0-9 excluding I, l, 1, O, 0
   * Excludes ambiguous characters that look similar in many fonts
   */
  password: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
} as const;

/**
 * Default symbol set for password generation
 */
const DEFAULT_SYMBOL_SET = '!@#$%^&*();:{}[]';

/**
 * Creates a custom password alphabet with configurable exclusions and symbols
 * 
 * @param options - Configuration for the password alphabet
 * @returns A string containing the custom alphabet
 * 
 * @example
 * ```typescript
 * // Basic password alphabet with default exclusions
 * const alphabet = createPasswordAlphabet();
 * 
 * // Exclude additional characters
 * const alphabet = createPasswordAlphabet({
 *   exclude: ['I', 'l', '1', 'O', '0', 'S', '5']
 * });
 * 
 * // Include symbols
 * const alphabet = createPasswordAlphabet({
 *   exclude: ['I', 'l', '1', 'O', '0'],
 *   includeSymbols: true
 * });
 * 
 * // Custom symbol set
 * const alphabet = createPasswordAlphabet({
 *   includeSymbols: true,
 *   symbolSet: '!@#$%'
 * });
 * ```
 */
export function createPasswordAlphabet(options: PasswordAlphabetOptions = {}): string {
  // Start with full alphanumeric
  let base: string = alphabets.alphanumeric;
  
  // Apply exclusions
  if (options.exclude && options.exclude.length > 0) {
    const excludeSet = new Set(options.exclude);
    base = base.split('').filter(c => !excludeSet.has(c)).join('');
  }
  
  // Add symbols if requested
  if (options.includeSymbols) {
    const symbols = options.symbolSet || DEFAULT_SYMBOL_SET;
    base += symbols;
  }
  
  return base;
}
