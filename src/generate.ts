import { randomBytes } from 'node:crypto';
import { alphabets } from './alphabets.js';
import type { GenerateOptions, SizeOption } from './types.js';

/**
 * Default size for random string generation
 */
const DEFAULT_SIZE = 31;

/**
 * Default alphabet for random string generation
 */
const DEFAULT_ALPHABET: string = alphabets.base64url;

/**
 * Get a uniformly distributed random index for the given alphabet length.
 * Uses rejection sampling to avoid modulo bias.
 * 
 * @param alphabetLength - The length of the alphabet
 * @returns A random index in range [0, alphabetLength)
 */
function getRandomIndex(alphabetLength: number): number {
  // Rejection sampling: only accept bytes in range [0, threshold)
  // where threshold is the largest multiple of alphabetLength <= 256
  const threshold = 256 - (256 % alphabetLength);
  let byte: number;
  
  do {
    const bytes = randomBytes(1);
    byte = bytes[0] as number;
  } while (byte >= threshold);
  
  return byte % alphabetLength;
}

/**
 * Resolve the size option to a concrete number.
 * 
 * @param size - The size option (number, or { min, max })
 * @returns The resolved size (always a positive number)
 * @throws Error if size is invalid
 */
function resolveSize(size: number | SizeOption | undefined): number {
  if (size === undefined) {
    return DEFAULT_SIZE;
  }
  
  if (typeof size === 'number') {
    if (size <= 0) {
      throw new Error('size must be a positive number');
    }
    return Math.floor(size);
  }
  
  // At this point, size must be SizeOption
  const sizeObj = size as SizeOption;
  
  if (sizeObj.min <= 0 || sizeObj.max <= 0) {
    throw new Error('min and max must be positive numbers');
  }
  
  if (sizeObj.min > sizeObj.max) {
    throw new Error('min must be less than or equal to max');
  }
  
  // Generate a random size between min and max (inclusive)
  return Math.floor(Math.random() * (sizeObj.max - sizeObj.min + 1)) + sizeObj.min;
}

/**
 * Validate that an alphabet is not empty.
 * 
 * @param alphabet - The alphabet string to validate
 * @throws Error if alphabet is empty
 */
function validateAlphabet(alphabet: string): void {
  if (alphabet.length === 0) {
    throw new Error('alphabet cannot be empty');
  }
}

/**
 * Generate random characters from the given alphabet.
 * 
 * @param alphabet - The alphabet to use (must be non-empty)
 * @param count - The number of characters to generate
 * @returns A string of random characters
 */
function generateRandomChars(alphabet: string, count: number): string {
  validateAlphabet(alphabet);
  
  const result: string[] = [];
  const len: number = alphabet.length;
  for (let i = 0; i < count; i++) {
    const index = getRandomIndex(len);
    result.push(alphabet[index] as string);
  }
  return result.join('');
}

/**
 * Apply chunking to a string by inserting delimiters.
 * Last chunk can be shorter than chunkSize.
 * 
 * @param str - The string to chunk
 * @param delimiter - The delimiter to insert between chunks
 * @param chunkSize - The size of each chunk
 * @returns The chunked string
 */
function applyChunking(str: string, delimiter: string, chunkSize: number): string {
  if (!delimiter || chunkSize <= 0) {
    return str;
  }
  
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks.join(delimiter);
}

/**
 * Apply a pattern to a string by replacing X placeholders with characters.
 * Automatically filters out pattern delimiter characters from the random string
 * to ensure clean formatting.
 * 
 * @param str - The string with random characters
 * @param pattern - The pattern with X placeholders
 * @param alphabet - The original alphabet (used to identify delimiters)
 * @returns The string formatted according to the pattern
 * @throws Error if the number of characters doesn't match the pattern
 * @throws Error if alphabet contains only delimiter characters
 */
function applyPattern(str: string, pattern: string | undefined, alphabet: string): string {
  if (pattern === undefined) {
    return str;
  }
  
  const patternStr: string = pattern;
  // Count X placeholders in pattern
  const xMatches = patternStr.match(/X/g);
  const xCount = xMatches ? xMatches.length : 0;
  
  // Validate that pattern contains at least one X placeholder
  if (xCount === 0) {
    throw new Error('pattern must contain at least one X placeholder');
  }
  
  if (str.length !== xCount) {
    throw new Error(`Pattern requires exactly ${xCount} characters, but generated ${str.length}`);
  }
  
  // Identify delimiter characters in the pattern (non-X characters)
  const patternChars = new Set(patternStr.split(''));
  const xChar = 'X';
  const delimiters = new Set(
    Array.from(patternChars).filter(c => c !== xChar)
  );
  
  // If there are delimiters in the pattern and they exist in the alphabet,
  // we need to ensure random characters don't match delimiters
  if (delimiters.size > 0) {
    const hasDelimiterInAlphabet = Array.from(delimiters).some(d => alphabet.includes(d));
    
    if (hasDelimiterInAlphabet) {
      // Filter out delimiter characters from the random string
      let filteredStr = '';
      for (let i = 0; i < str.length; i++) {
        const char = str[i] as string;
        if (!delimiters.has(char)) {
          filteredStr += char;
        }
      }
      
      // If we filtered out some characters, regenerate the missing ones
      if (filteredStr.length < xCount) {
        const needed = xCount - filteredStr.length;
        // Create alphabet without delimiters
        const alphabetWithoutDelimiters = Array.from(alphabet).filter(
          c => !delimiters.has(c)
        ).join('');
        
        if (alphabetWithoutDelimiters.length === 0) {
          throw new Error(
            `Alphabet contains only delimiter characters used in pattern: ${Array.from(delimiters).join(', ')}`
          );
        }
        
        // Generate additional characters
        const additional = generateRandomChars(alphabetWithoutDelimiters, needed);
        filteredStr += additional;
      }
      
      str = filteredStr;
    }
  }
  
  let result = patternStr;
  let strIndex = 0;
  
  // Replace each X with a character from the (possibly filtered) string
  for (let i = 0; i < patternStr.length; i++) {
    const patternChar = patternStr[i] as string;
    if (patternChar === xChar) {
      result = result.substring(0, i) + (str[strIndex++] as string) + result.substring(i + 1);
    }
  }
  
  return result;
}

/**
 * Generate a random string with the given options.
 * 
 * @param options - Options for string generation
 * @returns A randomly generated string
 * 
 * @example
 * ```typescript
 * // Simple usage
 * ropes.generate(); // 31 chars from base64url
 * 
 * // Custom size and alphabet
 * ropes.generate({ size: 16, alphabet: ropes.alphabets.hex });
 * 
 * // With prefix and suffix
 * ropes.generate({ size: 10, prefix: 'user_', suffix: '_2024' });
 * 
 * // Range mode
 * ropes.generate({ size: { min: 24, max: 32 } });
 * 
 * // Chunking
 * ropes.generate({ size: 16, delimiter: '-', chunkSize: 4 });
 * // Output: e.g., "abcd-efgh-ijkl-mnop"
 * 
 * // Pattern
 * ropes.generate({ size: 8, pattern: 'XX-XX-XX-XX' });
 * // Output: e.g., "aB-cD-eF-gH"
 * ```
 */
export function generate(options: GenerateOptions = {}): string {
  const alphabet: string = options.alphabet ?? DEFAULT_ALPHABET;
  const pattern: string | undefined = options.pattern;
  
  // Handle pattern mode separately
  if (pattern) {
    const xCount: number = (pattern.match(/X/g) || []).length;
    const randomChars: string = generateRandomChars(alphabet, xCount);
    return applyPattern(randomChars, pattern, alphabet);
  }
  
  // Resolve size for random character generation
  const finalSize: number = resolveSize(options.size);
  
  // Generate random characters
  const randomChars: string = generateRandomChars(alphabet, finalSize);
  
  // Build result
  let result: string = randomChars;
  
  // Apply chunking to random characters only (before prefix/suffix)
  if (options.delimiter && options.chunkSize) {
    result = applyChunking(result, options.delimiter, options.chunkSize);
  }
  
  // Apply prefix
  if (options.prefix) {
    result = options.prefix + result;
  }
  
  // Apply suffix
  if (options.suffix) {
    result = result + options.suffix;
  }
  
  return result;
}

/**
 * Asynchronously generate a random string with the given options.
 * Currently just wraps the synchronous version, but allows for future
 * async crypto operations if needed.
 * 
 * @param options - Options for string generation
 * @returns A promise that resolves to a randomly generated string
 */
export function generateAsync(options: GenerateOptions = {}): Promise<string> {
  return Promise.resolve(generate(options));
}

/**
 * Generate multiple random strings with the given options.
 * 
 * @param count - The number of strings to generate
 * @param options - Options for string generation
 * @returns An array of randomly generated strings
 * @throws Error if count is not positive
 */
export function generateMany(count: number, options: GenerateOptions = {}): string[] {
  if (count <= 0) {
    throw new Error('count must be a positive number');
  }
  
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generate(options));
  }
  return results;
}

/**
 * Asynchronously generate multiple random strings with the given options.
 * 
 * @param count - The number of strings to generate
 * @param options - Options for string generation
 * @returns A promise that resolves to an array of randomly generated strings
 */
export async function generateManyAsync(count: number, options: GenerateOptions = {}): Promise<string[]> {
  if (count <= 0) {
    throw new Error('count must be a positive number');
  }
  
  // Use Promise.all for parallel generation
  const promises: Promise<string>[] = [];
  for (let i = 0; i < count; i++) {
    promises.push(generateAsync(options));
  }
  return Promise.all(promises);
}
