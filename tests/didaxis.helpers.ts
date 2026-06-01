import type { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProgramsPage } from '../pages/programs.page';

export { extractProgramId, programIdFromCreateResponse, waitForProgramCreateResponse } from '../support/program-api.helpers';

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set (e.g. in .env)');
  }
  await new LoginPage(page).login(email, password);
}

export async function createProgramTracked(
  page: Page,
  trackProgram: (programId: string) => void,
  programName: string,
  description: string,
): Promise<void> {
  const programId = await new ProgramsPage(page).createProgram(programName, description);
  if (programId) {
    trackProgram(programId);
  }
}

export async function submitCreateTracked(
  page: Page,
  trackProgram: (programId: string) => void,
): Promise<string | undefined> {
  const programId = await new ProgramsPage(page).newProgramModal.submitAndGetProgramId();
  if (programId) {
    trackProgram(programId);
  }
  return programId;
}
