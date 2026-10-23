# Ropes

[![npm version](https://img.shields.io/npm/v/ropes.svg)](https://www.npmjs.com/package/@alkemist-17/ropes)
[![license](https://img.shields.io/npm/l/ropes.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Ropes** is a TypeScript library for generating cryptographically secure random strings. It provides a simple, functional API with configurable alphabets, size options, and formatting features.

## Features

- **Cryptographically Secure** - Uses Node.js `crypto.randomBytes()` for true randomness
- **Multiple Alphabets** - 7 built-in presets (base64, base64url, hex, alphanumeric, etc.)
- **Custom Alphabets** - Use your own character sets
- **Password-Safe** - Built-in alphabet excluding ambiguous characters (I, l, 1, O, 0)
- **Flexible Sizing** - Fixed size or range (min/max) modes
- **Formatting** - Prefix/suffix, chunking with delimiters, pattern templates
- **Bulk Generation** - Generate multiple strings at once
- **Seeded Mode** - Deterministic generation for testing (non-crypto)

## Installation

```bash
npm i @alkemist-17/ropes
```

## Usage

### Basic Usage

```typescript
import ropes from 'ropes';

// Generate a 31-character random string (default)
const token = ropes.generate();

// Custom size
const id = ropes.generate({ size: 16 });

// Custom alphabet
const hex = ropes.generate({ size: 32, alphabet: ropes.alphabets.hex });
```

### Alphabets

Ropes includes several built-in alphabet presets:

```typescript
import { alphabets } from 'ropes';

// Standard Base64 (RFC 4648)
ropes.generate({ alphabet: alphabets.base64 });
// A-Za-z0-9+/

// URL-safe Base64 (RFC 4648 §5)
ropes.generate({ alphabet: alphabets.base64url });
// A-Za-z0-9-_

// Hexadecimal
ropes.generate({ alphabet: alphabets.hex });
// 0-9a-f

// Alphanumeric
ropes.generate({ alphabet: alphabets.alphanumeric });
// A-Za-z0-9

// Lowercase alphanumeric
ropes.generate({ alphabet: alphabets.alphanumericLower });
// a-z0-9

// Numeric only
ropes.generate({ alphabet: alphabets.numeric });
// 0-9

// Password-safe (excludes I, l, 1, O, 0)
ropes.generate({ alphabet: alphabets.password });
```

### Custom Password Alphabet

Create password alphabets with custom exclusions and symbols:

```typescript
import { createPasswordAlphabet } from 'ropes';

// Exclude additional ambiguous characters
const strictPassword = createPasswordAlphabet({
  exclude: ['I', 'l', '1', 'O', '0', 'S', '5', 'B', '8']
});

// Include symbols
const symbolPassword = createPasswordAlphabet({
  includeSymbols: true,
  symbolSet: '!@#$%^&*'
});

// Use the custom alphabet
ropes.generate({ size: 16, alphabet: symbolPassword });
```

### Size Modes

```typescript
// Fixed size (default: 31)
ropes.generate({ size: 32 });

// Range mode - random size between min and max
ropes.generate({ size: { min: 24, max: 32 } });
```

### Prefix and Suffix

Add static text before and after the random string. **Prefix and suffix do NOT count toward the size.**

```typescript
// Generates: user_ABCDEFGHIJKLMNOP_suffix (16 random chars)
ropes.generate({ 
  size: 16, 
  prefix: 'user_', 
  suffix: '_suffix' 
});
```

### Chunking

Split the output into chunks with delimiters. The **last chunk can be shorter** than chunkSize.

```typescript
// Generates: abcd-efgh-ijkl-mnop (16 chars, 4 per chunk)
ropes.generate({ 
  size: 16, 
  delimiter: '-', 
  chunkSize: 4 
});

// With size=10, chunkSize=4: aaaa-bbbb-cc
ropes.generate({ size: 10, delimiter: '-', chunkSize: 4 });
```

### Pattern Templates

Use patterns with `X` as a placeholder for random characters. The size is determined by the number of `X` characters in the pattern.

```typescript
// Generates: aB-cD-eF-gH (8 random chars in XX-XX-XX-XX format)
ropes.generate({ pattern: 'XX-XX-XX-XX' });

// Product key style
ropes.generate({ pattern: 'XXX-XXX-XXX-XXX' });

// Mixed with prefix
ropes.generate({ pattern: 'XX-XX', prefix: 'KEY_' });
// Generates: KEY_aB-cD
```

**Note:** If your alphabet contains characters that appear in the pattern (e.g., using base64url alphabet with a `-` delimiter pattern), the output will include both the pattern delimiters and any matching characters from the random string. For guaranteed formatting, use an alphabet that doesn't include your pattern delimiters:

```typescript
// Safe: hex doesn't contain '-'
ropes.generate({ 
  pattern: 'XX-XX-XX-XX', 
  alphabet: ropes.alphabets.hex 
});

// Unsafe: base64url contains '-' which may appear in output
ropes.generate({ 
  pattern: 'XX-XX-XX-XX', 
  alphabet: ropes.alphabets.base64url 
});
// May produce: aB--cD-eF-gH (extra hyphens from random chars)
```

### Bulk Generation

Generate multiple strings at once:

```typescript
// Synchronous
const tokens = ropes.generateMany(10, { size: 32 });

// Asynchronous
const ids = await ropes.generateManyAsync(5, { 
  size: 16, 
  alphabet: ropes.alphabets.hex 
});
```

### Async API

All generation functions have async variants:

```typescript
// Single string
const token = await ropes.generateAsync({ size: 32 });

// Multiple strings
const tokens = await ropes.generateManyAsync(10, { size: 32 });
```

### Seeded Generation (Testing Only)

⚠️ **WARNING**: Seeded generation uses a pseudo-random number generator and is **NOT cryptographically secure**. Use this only for testing, development, or demos.

```typescript
// Same seed produces same output
const str1 = ropes.generateSeeded({ seed: 'my-test-seed', size: 16 });
const str2 = ropes.generateSeeded({ seed: 'my-test-seed', size: 16 });
console.log(str1 === str2); // true

// Different seeds produce different outputs
const str3 = ropes.generateSeeded({ seed: 'other-seed', size: 16 });
console.log(str1 === str3); // false
```

## API Reference

### Functions

#### `generate(options?)`

Generate a cryptographically secure random string.

**Parameters:**
```typescript
interface GenerateOptions {
  size?: number | { min: number; max: number };  // Default: 31
  alphabet?: string;                            // Default: base64url
  prefix?: string;                              // Does NOT count toward size
  suffix?: string;                              // Does NOT count toward size
  delimiter?: string;                           // Requires chunkSize
  chunkSize?: number;                          // Requires delimiter
  pattern?: string;                             // Uses X as placeholder
}
```

**Returns:** `string`

**Example:**
```typescript
ropes.generate({ size: 16, alphabet: ropes.alphabets.hex });
```

#### `generateAsync(options?)`

Async variant of `generate()`.

**Returns:** `Promise<string>`

#### `generateMany(count, options?)`

Generate multiple random strings.

**Parameters:**
- `count`: number - Number of strings to generate
- `options?`: GenerateOptions - Same as `generate()`

**Returns:** `string[]`

**Throws:** If count is not positive

#### `generateManyAsync(count, options?)`

Async variant of `generateMany()`.

**Returns:** `Promise<string[]>`

#### `generateSeeded(options)`

Generate a deterministic random string using a seed. **NOT CRYPTOGRAPHICALLY SECURE - FOR TESTING ONLY**

**Parameters:**
```typescript
interface SeededOptions {
  seed: string;                                 // Required
  size?: number | { min: number; max: number };
  alphabet?: string;
  prefix?: string;
  suffix?: string;
}
```

**Returns:** `string`

**Throws:** If seed is not provided

### Alphabets

#### Built-in Presets

| Alphabet | Characters | Size | Notes |
|----------|------------|------|-------|
| `base64` | A-Za-z0-9+/ | 64 | RFC 4648 |
| `base64url` | A-Za-z0-9-_ | 64 | URL-safe, RFC 4648 §5 |
| `hex` | 0-9a-f | 16 | Hexadecimal |
| `alphanumeric` | A-Za-z0-9 | 62 | All alphanumeric |
| `alphanumericLower` | a-z0-9 | 36 | Lowercase only |
| `numeric` | 0-9 | 10 | Digits only |
| `password` | A-Za-z0-9 (excl. I,l,1,O,0) | 57 | Password-safe |

#### `createPasswordAlphabet(options?)`

Create a custom password alphabet.

**Parameters:**
```typescript
interface PasswordAlphabetOptions {
  exclude?: string[];        // Characters to exclude
  includeSymbols?: boolean;   // Add symbol characters
  symbolSet?: string;        // Custom symbol set (default: '!@#$%^&*();:{}[]')
}
```

**Returns:** `string` - The custom alphabet

**Example:**
```typescript
const custom = createPasswordAlphabet({
  exclude: ['I', 'l', '1', 'O', '0'],
  includeSymbols: true,
  symbolSet: '!@#$%'
});
```

## Security Notes

### Cryptographic Security

- **Default generation** uses `node:crypto.randomBytes()` which provides cryptographically secure randomness
- **Rejection sampling** is used to ensure uniform distribution across the alphabet, avoiding modulo bias
- All built-in alphabets have been analyzed for security properties

### Entropy Analysis

| Alphabet | Bits/Char | 32-char string |
|----------|-----------|----------------|
| base64 | 6.0 | 192 bits |
| hex | 4.0 | 128 bits |
| alphanumeric | ~5.95 | ~190 bits |
| password | ~5.81 | ~186 bits |

All configurations provide sufficient entropy for most use cases. Collision probability is astronomically low for practical applications.

### ⚠️ Seeded Generation Warning

The `generateSeeded()` function uses a seeded pseudo-random number generator (`seedrandom` library). **This is NOT cryptographically secure** and should only be used for:
- Unit testing
- Development and debugging
- Demos and examples
- Non-security sensitive applications

**Never use seeded generation for:**
- Authentication tokens
- Session IDs
- Passwords
- API keys
- Any security-sensitive randomness

## Examples

### Token Generation

```typescript
import ropes from 'ropes';

// API token
const apiToken = ropes.generate({ size: 64 });

// Session ID
const sessionId = ropes.generate({ 
  size: 32, 
  alphabet: ropes.alphabets.alphanumeric 
});

// Short ID
const shortId = ropes.generate({ size: 8 });
```

### URL-Safe Tokens

```typescript
// For URLs, use base64url alphabet
const urlToken = ropes.generate({ 
  size: 48, 
  alphabet: ropes.alphabets.base64url 
});
// Example: xY7jKmLpQrStUvWxYz1234567890AbCdEfGh
```

### Formatted IDs

```typescript
// UUID-like format
const uuidLike = ropes.generate({ 
  size: 32, 
  delimiter: '-', 
  chunkSize: 8 
});
// Example: abcdefgh-ijklmnop-qrstuvwx-yz012345

// Product key format
const productKey = ropes.generate({ 
  pattern: 'XXXX-XXXX-XXXX-XXXX' 
});
// Example: aBcD-EfGh-IjKl-MnOp
```

### Bulk Operations

```typescript
// Generate 100 tokens for a batch process
const tokens = ropes.generateMany(100, { 
  size: 32, 
  prefix: 'batch_' 
});

// Process asynchronously
const results = await Promise.all([
  ropes.generateAsync({ size: 16 }),
  ropes.generateAsync({ size: 16 }),
  ropes.generateAsync({ size: 16 })
]);
```

### Testing with Seeded Generation

```typescript
import { describe, it, expect } from 'vitest';
import ropes from 'ropes';

describe('token generation', () => {
  it('generates consistent tokens for testing', () => {
    const token1 = ropes.generateSeeded({ seed: 'test-1', size: 16 });
    const token2 = ropes.generateSeeded({ seed: 'test-1', size: 16 });
    
    expect(token1).toBe(token2);
    // Token will always be the same for seed 'test-1'
  });
});
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request. Be sure that all your tests are all green.

## License

MIT © Eduardo Velazco Romero
