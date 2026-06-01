import { expect, test } from '../fixtures/didaxis.fixture';
import {
  createProgramTracked,
  descriptionInput,
  openEditForProgram,
  programNameInput,
  uniqueSuffix,
} from './didaxis.helpers';

test.describe('DS-2 — Edit existing program details', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Edit form opens with current program name and description', async ({
    page,
    trackProgram,
  }) => {
    const name = `Web Development ${uniqueSuffix()}`;
    const desc = `Full-stack web development program ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await openEditForProgram(page, name);
    await expect(programNameInput(page)).toHaveValue(name);
    await expect(descriptionInput(page)).toHaveValue(desc);
  });

  test('TC-002 — Renaming program updates list after Save', async ({ page, trackProgram }) => {
    const name = `Web Development ${uniqueSuffix()}`;
    const desc = `Original desc ${uniqueSuffix()}`;
    const updated = `${name} - Updated`;
    await createProgramTracked(page, trackProgram, name, desc);

    await openEditForProgram(page, name);
    await programNameInput(page).fill(updated);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(programNameInput(page)).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(updated, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(desc, { exact: false }).first()).toBeVisible();
  });

  test('TC-003 — Description-only edit leaves program name unchanged', async ({
    page,
    trackProgram,
  }) => {
    const name = `Data Science ${uniqueSuffix()}`;
    const originalDesc = `Original description ${uniqueSuffix()}`;
    const newDesc = `Updated cohort focus: ML and statistics ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, originalDesc);

    await openEditForProgram(page, name);
    await expect(programNameInput(page)).toHaveValue(name);
    await descriptionInput(page).fill(newDesc);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(programNameInput(page)).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(newDesc, { exact: false }).first()).toBeVisible();
  });

  test('TC-004 — Save with no edits keeps program unchanged', async ({ page, trackProgram }) => {
    const name = `Stable Program ${uniqueSuffix()}`;
    const desc = `Stable description ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await openEditForProgram(page, name);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(programNameInput(page)).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('TC-006 — Empty program name blocks save', async ({ page, trackProgram }) => {
    const name = `Named Program ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);

    await openEditForProgram(page, name);
    await programNameInput(page).fill('');
    await descriptionInput(page).fill(`Still here ${uniqueSuffix()}`);

    const save = page.getByRole('button', { name: 'Save' });
    if (await save.isDisabled()) {
      await expect(save).toBeDisabled();
    } else {
      await save.click();
      await expect(programNameInput(page)).toBeVisible();
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test('TC-007 — Cancel dismisses edit without persisting changes', async ({
    page,
    trackProgram,
  }) => {
    const name = `Cancel Target ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);

    await openEditForProgram(page, name);
    await programNameInput(page).fill(`Should Not Persist ${uniqueSuffix()}`);
    await descriptionInput(page).fill('Discard me');

    const cancel = page.getByRole('button', { name: 'Cancel' });
    if (await cancel.isVisible()) {
      await cancel.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await expect(programNameInput(page)).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('TC-014 — Unicode and special characters in name and description persist after edit', async ({
    page,
    trackProgram,
  }) => {
    const name = `Edit Unicode Base ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `Start ${uniqueSuffix()}`);

    const newName = `Program — 日本語 & QA ${uniqueSuffix()}`;
    const newDesc = `Symbols: < > " ' & © ${uniqueSuffix()}`;

    await openEditForProgram(page, name);
    await programNameInput(page).fill(newName);
    await descriptionInput(page).fill(newDesc);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(programNameInput(page)).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(newName, { exact: true }).first()).toBeVisible();
  });

  test('TC-018 — Script-like description after edit does not trigger dialog', async ({
    page,
    trackProgram,
  }) => {
    const name = `XSS Edit Base ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `Safe ${uniqueSuffix()}`);
    const xss = '<img src=x onerror=alert(1)>';
    let dialogSeen = false;
    page.on('dialog', (d) => {
      dialogSeen = true;
      void d.dismiss();
    });

    await openEditForProgram(page, name);
    await descriptionInput(page).fill(xss);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(programNameInput(page)).toBeHidden({ timeout: 15_000 });

    await page.goto('/programs');
    await page.waitForLoadState('networkidle');
    expect(dialogSeen).toBe(false);
    await expect(page.getByText(xss).first()).toBeVisible();
  });
});
