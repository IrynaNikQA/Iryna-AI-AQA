import { test as cleanupTest, expect } from './cleanup.fixture';
import { AUTH_FILE } from '../tests/auth.constants';

/**
 * Didaxis specs (ds*.spec.ts). Uses saved session from tests/auth.setup.ts.
 * Run with `--project=chromium-didaxis` so setup runs before tests.
 */
export const test = cleanupTest;
test.use({ storageState: AUTH_FILE });

export { expect };
