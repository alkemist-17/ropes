/**
 * Ropes - A TypeScript library for generating random strings
 * 
 * Features:
 * - Cryptographically secure random string generation
 * - Multiple alphabet presets (base64, hex, alphanumeric, etc.)
 * - Password-safe alphabet with configurable exclusions
 * - Custom alphabet support
 * - Size modes: fixed or range (min/max)
 * - Prefix and suffix support
 * - Chunking with custom delimiters
 * - Pattern support with X placeholders
 * - Multiple string generation
 * - Seeded generation for testing (non-crypto)
 */

// Core generation functions
import {
  generate,
  generateAsync,
  generateMany,
  generateManyAsync
} from './generate.js';

// Seeded generation (non-crypto, for testing only)
import { generateSeeded } from './seed.js';

// Alphabet presets and utilities
import { alphabets, createPasswordAlphabet } from './alphabets.js';

// Type exports
import type {
  GenerateOptions,
  SizeOption,
  PasswordAlphabetOptions,
  SeededOptions
} from './types.js';

// Named exports
export {
  generate,
  generateAsync,
  generateMany,
  generateManyAsync,
  generateSeeded,
  alphabets,
  createPasswordAlphabet
};

export type {
  GenerateOptions,
  SizeOption,
  PasswordAlphabetOptions,
  SeededOptions
};

// Default export
export default {
  generate,
  generateAsync,
  generateMany,
  generateManyAsync,
  generateSeeded,
  alphabets,
  createPasswordAlphabet
};
