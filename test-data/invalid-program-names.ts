/**
 * Curated invalid / boundary program names for negative-path tests.
 * Keep happy-path variety in Faker factories; keep edge cases explicit here.
 */
export const WHITESPACE_ONLY_NAMES = ['   ', '\t\t\t', '\n\n'] as const;

export const INJECTION_LIKE_NAMES = [
  "O'Brien'; DROP TABLE programs;--",
  'Course <Advanced> & "Quotes"',
  '<img src=x onerror=alert(1)>',
] as const;

export const XSS_DESCRIPTIONS = ['<img src=x onerror=alert(1)>'] as const;
