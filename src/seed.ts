/**
 * Seeded random string generation
 * 
 * WARNING: This module uses a seeded pseudo-random number generator (PRNG)
 * which is NOT cryptographically secure. The output is deterministic and
 * predictable given the same seed.
 * 
 * USE THIS ONLY FOR:
 * - Testing
 * - Development
 * - Demos
 * - Non-security sensitive applications
 * 
 * DO NOT USE THIS FOR:
 * - Authentication tokens
 * - Session IDs
 * - Passwords
 * - API keys
 * - Any security-sensitive randomness
 */

import createPrng from 'seedrandom';
import { alphabets } from './alphabets.js';
import type { SeededOptions, SizeOption } from './types.js';

type PRNG = () => number;

/**
 * Default size for seeded string generation
 */
const DEFAULT_SEEDED_SIZE = 31;

/**
 * Default alphabet for seeded string generation
 */
const DEFAULT_SEEDED_ALPHABET: string = alphabets.base64url;

/**
 * Get a uniformly distributed random index for the given alphabet length using a seeded PRNG.
 * Uses rejection sampling to avoid modulo bias.
 * 
 * @param prng - The seeded PRNG function
 * @param alphabetLength - The length of the alphabet
 * @returns A random index in range [0, alphabetLength)
 */
function getSeededRandomIndex(prng: PRNG, alphabetLength: number): number {
  // Rejection sampling: only accept values in range [0, threshold)
  // where threshold is the largest multiple of alphabetLength <= 256
  const threshold = 256 - (256 % alphabetLength);
  let byte: number;
  
  do {
    byte = Math.floor(prng() * 256) as number;
  } while (byte >= threshold);
  
  return byte % alphabetLength;
}

/**
 * Validate that an alphabet is not empty.
 * 
 * @param alphabet - The alphabet string to validate
 * @throws Error if alphabet is empty
 */
function validateSeededAlphabet(alphabet: string): void {
  if (alphabet.length === 0) {
    throw new Error('alphabet cannot be empty');
  }
}

/**
 * Generate a random string using a seeded PRNG for deterministic output.
 * 
 * IMPORTANT: This function is NOT cryptographically secure. It uses a seeded
 * pseudo-random number generator which produces predictable output given
 * the same seed. Use this only for testing, development, demos, or non-security
 * sensitive applications.
 * 
 * For cryptographically secure random strings, use `generate()` or `generateAsync()` instead.
 * 
 * @param options - Options for seeded string generation (must include seed)
 * @returns A deterministically generated string based on the seed
 * @throws Error if seed is not provided or options are invalid
 * 
 * @example
 * ```typescript
 * // Always produces the same output for the same seed
 * ropes.generateSeeded({ seed: 'my-seed', size: 16 });
 * ropes.generateSeeded({ seed: 'my-seed', size: 16 }); // Same output
 * 
 * // Different seed produces different output
 * ropes.generateSeeded({ seed: 'other-seed', size: 16 });
 * 
 * // With alphabet and size range
 * ropes.generateSeeded({ 
 *   seed: 'test', 
 *   size: { min: 10, max: 20 },
 *   alphabet: ropes.alphabets.hex
 * });
 * ```
 */
export function generateSeeded(options: SeededOptions): string {
  // Use nullish coalescing to handle undefined alphabet
  const alphabet: string = options.alphabet ?? DEFAULT_SEEDED_ALPHABET;
  
  if (!options.seed) {
    throw new Error('seed is required for generateSeeded');
  }
  
  // Create seeded PRNG
  const prng: PRNG = createPrng(options.seed);
  
  // Resolve size
  let finalSize: number;
  if (options.size === undefined) {
    finalSize = DEFAULT_SEEDED_SIZE;
  } else if (typeof options.size === 'number') {
    if (options.size <= 0) {
      throw new Error('size must be a positive number');
    }
    finalSize = Math.floor(options.size);
  } else {
    // SizeOption object - use seeded PRNG for deterministic selection
    const sizeObj: SizeOption = options.size as SizeOption;
    if (sizeObj.min <= 0 || sizeObj.max <= 0) {
      throw new Error('min and max must be positive numbers');
    }
    if (sizeObj.min > sizeObj.max) {
      throw new Error('min must be less than or equal to max');
    }
    finalSize = Math.floor(prng() * (sizeObj.max - sizeObj.min + 1)) + sizeObj.min;
  }
  
  validateSeededAlphabet(alphabet);
  
  // Generate random characters
  const result: string[] = [];
  for (let i = 0; i < finalSize; i++) {
    const index = getSeededRandomIndex(prng, alphabet.length);
    result.push(alphabet[index] as string);
  }
  
  let output: string = result.join('');
  
  // Apply prefix (does NOT count toward size)
  if (options.prefix) {
    output = options.prefix + output;
  }
  
  // Apply suffix (does NOT count toward size)
  if (options.suffix) {
    output = output + options.suffix;
  }
  
  return output;
}
