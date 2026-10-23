/**
 * Size option for range mode
 */
export interface SizeOption {
  min: number;
  max: number;
}

/**
 * Options for generating a single random string
 */
export interface GenerateOptions {
  /**
   * Size of the random string (number of random characters)
   * Default: 31
   * Does NOT include prefix/suffix length
   */
  size?: number | SizeOption;
  
  /**
   * Alphabet to use for random characters
   * Default: base64url
   */
  alphabet?: string;
  
  /**
   * Prefix to add before the random string
   * Does NOT count toward size
   */
  prefix?: string;
  
  /**
   * Suffix to add after the random string
   * Does NOT count toward size
   */
  suffix?: string;
  
  /**
   * Delimiter for chunking the output
   * Requires chunkSize to be set
   */
  delimiter?: string;
  
  /**
   * Size of each chunk (last chunk can be shorter)
   * Requires delimiter to be set
   */
  chunkSize?: number;
  
  /**
   * Pattern with X as placeholder for random characters
   * If set, size is determined by number of X's in pattern
   * Prefix/suffix are ignored when pattern is used
   */
  pattern?: string;
}

/**
 * Options for creating a password alphabet
 */
export interface PasswordAlphabetOptions {
  /**
   * Characters to exclude from the alphabet
   */
  exclude?: string[];
  
  /**
   * Whether to include symbol characters
   * Default: false
   */
  includeSymbols?: boolean;
  
  /**
   * Custom set of symbols to use when includeSymbols is true
   * Default: '!@#$%^&*();:{}[]'
   */
  symbolSet?: string;
}

/**
 * Options for seeded (non-cryptographic) generation
 * FOR TESTING AND DEMOS ONLY - NOT FOR SECURITY SENSITIVE USE
 */
export interface SeededOptions extends Omit<GenerateOptions, 'alphabet'> {
  /**
   * Seed value for deterministic generation
   * Required for seeded mode
   */
  seed: string;
  
  /**
   * Alphabet to use
   */
  alphabet?: string;
}
