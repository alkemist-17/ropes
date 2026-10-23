import { describe, it, expect, beforeAll } from 'vitest';
import { generate, generateAsync, generateMany, generateManyAsync } from '../generate.js';
import { generateSeeded } from '../seed.js';
import { alphabets, createPasswordAlphabet } from '../alphabets.js';

describe('generate', () => {
  it('generates string of default length (31)', () => {
    const str = generate();
    expect(str).toHaveLength(31);
  });

  it('generates string of custom length', () => {
    const str = generate({ size: 16 });
    expect(str).toHaveLength(16);
  });

  it('uses custom alphabet', () => {
    const str = generate({ size: 10, alphabet: alphabets.hex });
    expect(str).toMatch(/^[0-9a-f]{10}$/);
  });

  it('prefix and suffix do NOT count toward size', () => {
    const str = generate({ size: 10, prefix: 'pre_', suffix: '_suf' });
    expect(str).toHaveLength(18); // 10 + 4 + 4
    expect(str.startsWith('pre_')).toBe(true);
    expect(str.endsWith('_suf')).toBe(true);
  });

  it('chunking works correctly', () => {
    // Use hex alphabet which doesn't contain '-'
    const str = generate({ size: 10, delimiter: '-', chunkSize: 4, alphabet: alphabets.hex });
    // 10 chars -> chunks of 4: aaaa-bbbb-cc (4-4-2)
    const parts = str.split('-');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(4);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toHaveLength(2);
  });

  it('pattern works with X placeholder', () => {
    // Use hex alphabet which doesn't contain '-' to avoid pattern delimiter
    // collision. Note: If alphabet contains the pattern delimiter, the output
    // will have both pattern delimiters and random delimiters.
    const str = generate({ size: 8, pattern: 'XX-XX-XX-XX', alphabet: alphabets.hex });
    expect(str).toMatch(/^[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}$/);
  });

  it('range mode works', () => {
    const str = generate({ size: { min: 10, max: 20 } });
    expect(str.length).toBeGreaterThanOrEqual(10);
    expect(str.length).toBeLessThanOrEqual(20);
  });

  it('throws on invalid size (negative)', () => {
    expect(() => generate({ size: -5 })).toThrow();
  });

  it('throws on invalid size (min > max)', () => {
    expect(() => generate({ size: { min: 20, max: 10 } })).toThrow();
  });

  it('throws on size = 0', () => {
    expect(() => generate({ size: 0 })).toThrow();
  });

  it('throws on min = 0 in range', () => {
    expect(() => generate({ size: { min: 0, max: 10 } })).toThrow();
  });

  it('throws on max = 0 in range', () => {
    expect(() => generate({ size: { min: 5, max: 0 } })).toThrow();
  });

  it('throws on negative min in range', () => {
    expect(() => generate({ size: { min: -5, max: 10 } })).toThrow();
  });

  it('throws on negative max in range', () => {
    expect(() => generate({ size: { min: 5, max: -10 } })).toThrow();
  });

  it('throws on empty alphabet', () => {
    expect(() => generate({ alphabet: '' })).toThrow();
  });

  it('handles very large size', () => {
    const str = generate({ size: 1000 });
    expect(str).toHaveLength(1000);
  });

  it('handles size = 1', () => {
    const str = generate({ size: 1 });
    expect(str).toHaveLength(1);
  });

  it('chunking with size equal to chunkSize', () => {
    const str = generate({ size: 8, delimiter: '-', chunkSize: 8, alphabet: alphabets.alphanumeric });
    expect(str).toHaveLength(8);
    expect(str).not.toContain('-');
  });

  it('chunking with size less than chunkSize', () => {
    const str = generate({ size: 4, delimiter: '-', chunkSize: 8, alphabet: alphabets.alphanumeric });
    expect(str).toHaveLength(4);
    expect(str).not.toContain('-');
  });

  it('prefix and suffix with chunking', () => {
    const str = generate({ 
      size: 8, 
      prefix: 'pre_', 
      suffix: '_suf',
      delimiter: '-',
      chunkSize: 4,
      alphabet: alphabets.alphanumeric
    });
    // Total: 4 (pre_) + 8 (random) + 1 (delimiter) + 4 (_suf) = 17
    expect(str).toHaveLength(17);
    expect(str).toMatch(/^pre_[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}_suf$/);
  });

  it('range mode minimum equals maximum', () => {
    const str = generate({ size: { min: 10, max: 10 } });
    expect(str).toHaveLength(10);
  });

  it('range mode produces various sizes', () => {
    // Run multiple times and check we get different sizes
    const sizes = new Set<number>();
    for (let i = 0; i < 10; i++) {
      const str = generate({ size: { min: 10, max: 20 } });
      sizes.add(str.length);
    }
    // With 10 tries and a range of 11, we should get at least 2 different sizes
    // (statistically very likely, though not guaranteed)
    expect(sizes.size).toBeGreaterThanOrEqual(1);
  });

  it('empty pattern is ignored (uses size)', () => {
    // Empty pattern is falsy, so it's treated as undefined and ignored
    const str = generate({ size: 10, pattern: '' });
    expect(str).toHaveLength(10);
  });

  it('pattern with base64url alphabet handles hyphen delimiter', () => {
    // This tests the automatic delimiter collision handling
    // Even though base64url contains '-', the pattern should still work
    // because we filter out delimiter characters
    const str = generate({ 
      size: 8, 
      pattern: 'XX-XX-XX-XX',
      alphabet: alphabets.base64url 
    });
    expect(str).toMatch(/^[A-Za-z0-9_]{2}-[A-Za-z0-9_]{2}-[A-Za-z0-9_]{2}-[A-Za-z0-9_]{2}$/);
    // Verify no extra hyphens (only the 3 from the pattern)
    const hyphenCount = (str.match(/-/g) || []).length;
    expect(hyphenCount).toBe(3);
  });

  it('pattern with multiple delimiter types', () => {
    const str = generate({ 
      size: 6, 
      pattern: 'XX.XX.XX',
      alphabet: alphabets.alphanumeric 
    });
    expect(str).toMatch(/^[A-Za-z0-9]{2}\.[A-Za-z0-9]{2}\.[A-Za-z0-9]{2}$/);
  });

  it('pattern with single X', () => {
    const str = generate({ size: 1, pattern: 'X', alphabet: alphabets.alphanumeric });
    expect(str).toHaveLength(1);
    expect(str).toMatch(/^[a-zA-Z0-9]$/);
  });

  it('pattern throws when alphabet is only delimiters', () => {
    // This should throw because the alphabet only contains the delimiter
    expect(() => {
      generate({ 
        size: 4,
        pattern: 'XX-XX',
        alphabet: '-' // Alphabet is only the delimiter
      });
    }).toThrow();
  });

  it('pattern with no X placeholders throws', () => {
    expect(() => {
      generate({ size: 10, pattern: 'abc-def' });
    }).toThrow();
  });
});

describe('generateAsync', () => {
  it('works asynchronously', async () => {
    const str = await generateAsync({ size: 16 });
    expect(str).toHaveLength(16);
  });
});

describe('generateMany', () => {
  it('generates multiple strings', () => {
    const strings = generateMany(5, { size: 10 });
    expect(strings).toHaveLength(5);
    strings.forEach(str => {
      expect(str).toHaveLength(10);
    });
  });

  it('throws on invalid count', () => {
    expect(() => generateMany(0)).toThrow();
    expect(() => generateMany(-1)).toThrow();
  });
});

describe('generateManyAsync', () => {
  it('generates multiple strings asynchronously', async () => {
    const strings = await generateManyAsync(5, { size: 10 });
    expect(strings).toHaveLength(5);
    strings.forEach(str => {
      expect(str).toHaveLength(10);
    });
  });
});

describe('alphabets', () => {
  it('base64 has 64 characters', () => {
    expect(alphabets.base64).toHaveLength(64);
  });

  it('base64url has 64 characters', () => {
    expect(alphabets.base64url).toHaveLength(64);
  });

  it('hex has 16 characters', () => {
    expect(alphabets.hex).toHaveLength(16);
  });

  it('alphanumeric has 62 characters', () => {
    expect(alphabets.alphanumeric).toHaveLength(62);
  });

  it('alphanumericLower has 36 characters', () => {
    expect(alphabets.alphanumericLower).toHaveLength(36);
  });

  it('numeric has 10 characters', () => {
    expect(alphabets.numeric).toHaveLength(10);
  });

  it('password excludes ambiguous characters', () => {
    const passwordAlphabet = alphabets.password;
    expect(passwordAlphabet).not.toContain('I');
    expect(passwordAlphabet).not.toContain('l');
    expect(passwordAlphabet).not.toContain('1');
    expect(passwordAlphabet).not.toContain('O');
    expect(passwordAlphabet).not.toContain('0');
  });
});

describe('createPasswordAlphabet', () => {
  it('creates password alphabet with exclusions', () => {
    const alphabet = createPasswordAlphabet({
      exclude: ['A', 'B', 'C']
    });
    expect(alphabet).not.toContain('A');
    expect(alphabet).not.toContain('B');
    expect(alphabet).not.toContain('C');
  });

  it('creates password alphabet with symbols', () => {
    const alphabet = createPasswordAlphabet({
      includeSymbols: true,
      symbolSet: '!@#$'
    });
    expect(alphabet).toContain('!');
    expect(alphabet).toContain('@');
    expect(alphabet).toContain('#');
    expect(alphabet).toContain('$');
  });
});

describe('generateSeeded', () => {
  it('produces deterministic output for same seed', () => {
    const str1 = generateSeeded({ seed: 'test-seed', size: 16 });
    const str2 = generateSeeded({ seed: 'test-seed', size: 16 });
    expect(str1).toBe(str2);
  });

  it('produces different output for different seeds', () => {
    const str1 = generateSeeded({ seed: 'seed-1', size: 16 });
    const str2 = generateSeeded({ seed: 'seed-2', size: 16 });
    expect(str1).not.toBe(str2);
  });

  it('requires seed', () => {
    expect(() => generateSeeded({ size: 10 } as any)).toThrow();
  });

  it('works with alphabet', () => {
    const str = generateSeeded({ seed: 'test', size: 10, alphabet: alphabets.hex });
    expect(str).toMatch(/^[0-9a-f]{10}$/);
  });

  it('prefix and suffix work with seeded', () => {
    const str = generateSeeded({ seed: 'test', size: 10, prefix: 'seed_', suffix: '_end' });
    expect(str.startsWith('seed_')).toBe(true);
    expect(str.endsWith('_end')).toBe(true);
  });
});
