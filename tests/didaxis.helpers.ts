import { expect, type Locator, type Page, type Response } from '@playwright/test';

export function extractProgramId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  if (typeof record.id === 'string') {
    return record.id;
  }

  const data = record.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nestedId = (data as Record<string, unknown>).id;
    if (typeof nestedId === 'string') {
      return nestedId;
    }
  }

  if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
    const firstId = (data[0] as Record<string, unknown>).id;
    if (typeof firstId === 'string') {
      return firstId;
    }
  }

  return undefined;
}

export function waitForProgramCreateResponse(page: Page) {
  return page.waitForResponse(
    (res) => res.url().includes('/api/programs') && res.request().method() === 'POST',
    { timeout: 30_000 },
  );
}

export async function programIdFromCreateResponse(response: Response): Promise<string | undefined> {
  if (!response.ok()) {
    return undefined;
  }
  try {
    return extractProgramId(await response.json());
  } catch {
    return undefined;
  }
}

export async function clickCreateAndGetProgramId(page: Page): Promise<string | undefined> {
  const responsePromise = waitForProgramCreateResponse(page);
  await page.getByRole('button', { name: 'Create' }).click();
  return programIdFromCreateResponse(await responsePromise);
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set (e.g. in .env)');
  }
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

export async function gotoPrograms(page: Page): Promise<void> {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).waitFor({ state: 'visible', timeout: 30_000 });
}

/** Data row: has program title and row actions (excludes header `tr`). */
export function programRow(page: Page, programName: string): Locator {
  return page
    .locator('tr')
    .filter({ has: page.getByText(programName, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: '✏️' }) })
    .first();
}

/** Create form field: product uses "Program Name"; edit AC may say "Name". */
export function programNameInput(page: Page): Locator {
  return page.getByLabel('Program Name').or(page.getByLabel('Name'));
}

export function descriptionInput(page: Page): Locator {
  return page.getByLabel('Description');
}

export async function openNewProgramModal(page: Page): Promise<void> {
  await gotoPrograms(page);
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(page.getByLabel('Program Name')).toBeVisible();
}

export async function createProgram(
  page: Page,
  programName: string,
  description: string,
): Promise<string | undefined> {
  await openNewProgramModal(page);
  await page.getByLabel('Program Name').fill(programName);
  await page.getByLabel('Description').fill(description);
  const programId = await clickCreateAndGetProgramId(page);
  await expect(page.getByLabel('Program Name')).toBeHidden({ timeout: 15_000 });
  return programId;
}

/** Creates a program and registers its UUID for API teardown after the test. */
export async function createProgramTracked(
  page: Page,
  trackProgram: (programId: string) => void,
  programName: string,
  description: string,
): Promise<void> {
  const programId = await createProgram(page, programName, description);
  if (programId) {
    trackProgram(programId);
  }
}

/** Clicks Create, captures UUID from POST /api/programs, and registers it for teardown. */
export async function submitCreateTracked(
  page: Page,
  trackProgram: (programId: string) => void,
): Promise<string | undefined> {
  const programId = await clickCreateAndGetProgramId(page);
  if (programId) {
    trackProgram(programId);
  }
  return programId;
}

export async function openEditForProgram(page: Page, programName: string): Promise<void> {
  await gotoPrograms(page);
  await programRow(page, programName).getByRole('button', { name: '✏️' }).click();
  await expect(programNameInput(page)).toBeVisible({ timeout: 15_000 });
}

export async function clickDeleteIconForProgram(page: Page, programName: string): Promise<void> {
  await gotoPrograms(page);
  await programRow(page, programName).getByRole('button', { name: '🗑' }).click();
}
