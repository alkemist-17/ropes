# CHANGELOG

All notable changes to the **ropes** library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-21

### Initial Release

First stable release of **ropes** - a TypeScript library for generating cryptographically secure random strings.

---

### Added

#### Core Features
- **Functional API** with default export for simple usage
- **Synchronous and asynchronous** variants of all generation functions
- **Rejection sampling** algorithm to ensure uniform distribution across all alphabet sizes (fixes modulo bias)
- **Configurable default size** of 31 characters

#### Alphabets (7 Built-in Presets)
- `base64` - Standard Base64 (RFC 4648): A-Za-z0-9+/ (64 chars)
- `base64url` - URL-safe Base64 (RFC 4648 §5): A-Za-z0-9-_ (64 chars)
- `hex` - Hexadecimal: 0-9a-f (16 chars)
- `alphanumeric` - Full alphanumeric: A-Za-z0-9 (62 chars)
- `alphanumericLower` - Lowercase alphanumeric: a-z0-9 (36 chars)
- `numeric` - Numeric only: 0-9 (10 chars)
- `password` - Password-safe: A-Za-z0-9 excluding I, l, 1, O, 0 (57 chars)

#### Alphabet Customization
- `createPasswordAlphabet()` function for creating custom password alphabets
- Support for excluding specific characters
- Support for including symbol characters (!@#$%^&*)
- Support for custom symbol sets
- Custom alphabet support (users can provide their own character sets)
- Minimal validation (only checks for empty alphabets)

#### Size Modes
- **Fixed size**: Single number (e.g., `size: 32`)
- **Range mode**: Random size between min and max (e.g., `size: { min: 24, max: 32 }`)

#### Formatting Features
- **Prefix/Suffix**: Add static text before/after random string (does NOT count toward size)
- **Chunking**: Split output with delimiters (last chunk can be shorter than chunkSize)
- **Patterns**: Template-based generation using `X` as placeholder (e.g., `pattern: 'XX-XX-XX-XX'`)

#### Generation Functions
- `generate(options?)` - Generate a single random string
- `generateAsync(options?)` - Async variant of generate
- `generateMany(count, options?)` - Generate multiple strings synchronously
- `generateManyAsync(count, options?)` - Generate multiple strings asynchronously

#### Seeded Generation (Non-Cryptographic)
- `generateSeeded({ seed, ...options })` - Deterministic string generation for testing
- Uses `seedrandom` library for seeded PRNG
- **Clear documentation**: FOR TESTING AND DEMOS ONLY - NOT FOR SECURITY SENSITIVE USE

#### Cryptographic Security
- Uses Node.js `crypto.randomBytes()` for cryptographically secure randomness
- Rejection sampling ensures uniform distribution for all alphabet sizes
- Analyzed bias for all built-in alphabets
- Documented entropy levels for all presets

#### Project Structure
- TypeScript source in `src/`
- Compiled output in `dist/`
- Comprehensive test suite with Vitest
- Full TypeScript type definitions

#### Tests
- 29 unit tests covering all features
- Tests for all alphabet presets
- Tests for size modes (fixed and range)
- Tests for all formatting features
- Tests for error handling
- Tests for seeded generation determinism

---

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

---

## Notes

### Security Considerations

This release implements **cryptographically secure** random string generation by default, using Node.js's `crypto.randomBytes()`. The library employs **rejection sampling** to ensure uniform distribution across all alphabet sizes, eliminating modulo bias that could affect randomness quality.

**Important**: The `generateSeeded()` function uses a seeded pseudo-random number generator and is **NOT cryptographically secure**. It is intended solely for testing, development, and demonstration purposes. Never use seeded generation for security-sensitive applications such as authentication tokens, session IDs, passwords, or API keys.

### Migration Guide

This is the initial release. No migration is required.

### Breaking Changes

None for initial release.

---

[1.0.0]: https://github.com/your-username/ropes/compare/v0.1.0...v1.0.0
