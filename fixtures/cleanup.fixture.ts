import { test as base } from '@playwright/test';
import { deleteProgram } from '../support/delete-program';

type CleanupFixtures = {
  /** Register a program UUID for API teardown after the test finishes. */
  trackProgram: (programId: string) => void;
};

export const test = base.extend<CleanupFixtures>({
  trackProgram: async ({}, use, testInfo) => {
    const tracked = new Set<string>();

    await use((programId: string) => {
      const id = programId?.trim();
      if (id) {
        tracked.add(id);
      }
    });

    if (tracked.size === 0) {
      return;
    }

    if (!process.env.DIDAXIS_API_TOKEN) {
      testInfo.annotations.push({
        type: 'cleanup',
        description: 'Skipped API cleanup: DIDAXIS_API_TOKEN is not set',
      });
      return;
    }

    const failures: string[] = [];

    for (const programId of tracked) {
      try {
        await deleteProgram(programId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${programId}: ${message}`);
      }
    }

    if (failures.length > 0) {
      testInfo.annotations.push({
        type: 'cleanup',
        description: `Failed to delete ${failures.length} program(s): ${failures.join('; ')}`,
      });
      console.warn(`[cleanup] ${testInfo.title}: ${failures.join('; ')}`);
    }
  },
});

export { expect } from '@playwright/test';
