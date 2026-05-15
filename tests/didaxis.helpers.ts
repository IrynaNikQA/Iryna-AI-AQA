import { expect, type Locator, type Page } from '@playwright/test';

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

export async function createProgram(page: Page, programName: string, description: string): Promise<void> {
  await openNewProgramModal(page);
  await page.getByLabel('Program Name').fill(programName);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByLabel('Program Name')).toBeHidden({ timeout: 15_000 });
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
