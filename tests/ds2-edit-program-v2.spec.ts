import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

function waitForProgramUpdateResponse(page: Page) {
  return page.waitForResponse(
    (res) =>
      res.url().includes('/api/programs') &&
      (res.request().method() === 'PUT' || res.request().method() === 'PATCH'),
    { timeout: 30_000 },
  );
}

test.describe('DS-2 — Edit existing program details', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Edit form shows current Name / Program Name and Description for Web Development 2026', async ({
    page,
    trackProgram,
  }) => {
    const name = `Web Development 2026 ${uniqueSuffix()}`;
    const desc = `Full-stack web development program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.openEditForProgram(name);

    await expect(edit.dialog).toBeVisible();
    await expect(edit.programNameInput).toHaveValue(name);
    await expect(edit.descriptionInput).toHaveValue(desc);
    await expect(edit.saveButton).toBeVisible();
  });

  test('TC-002 — After Save, the list shows Web Development 2026 - Updated and the edit UI closes', async ({
    page,
    trackProgram,
  }) => {
    const name = `Web Development 2026 ${uniqueSuffix()}`;
    const desc = `Original desc ${uniqueSuffix()}`;
    const updated = `${name} - Updated`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(updated);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(updated).first()).toBeVisible();
    await expect(programs.programText(name)).toHaveCount(0);
  });

  test('TC-003 — After changing only Description, Name / Program Name remains Machine Learning 2027', async ({
    page,
    trackProgram,
  }) => {
    const name = `Machine Learning 2027 ${uniqueSuffix()}`;
    const originalDesc = `Original syllabus ${uniqueSuffix()}`;
    const newDesc = `Revised syllabus — cohort Q2 2026 ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, originalDesc);
    await programs.openEditForProgram(name);

    await expect(edit.programNameInput).toHaveValue(name);
    await edit.fillDescription(newDesc);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining(newDesc).first()).toBeVisible();
  });

  test('TC-004 — Save with no edits leaves Stable Program 88 and Stable description 88 unchanged', async ({
    page,
    trackProgram,
  }) => {
    const name = `Stable Program 88 ${uniqueSuffix()}`;
    const desc = `Stable description 88 ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.openEditForProgram(name);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining(desc).first()).toBeVisible();
  });

  test('TC-005 — Single Save persists both Name Alpha Program - Revised and Description Revised scope and outcomes', async ({
    page,
    trackProgram,
  }) => {
    const name = `Alpha Program ${uniqueSuffix()}`;
    const revisedName = `Alpha Program - Revised ${uniqueSuffix()}`;
    const revisedDesc = `Revised scope and outcomes ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Original ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(revisedName);
    await edit.fillDescription(revisedDesc);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(revisedName).first()).toBeVisible();
    await expect(programs.textContaining(revisedDesc).first()).toBeVisible();
  });

  test('TC-006 — Clearing Name / Program Name does not persist for Named Program Alpha', async ({
    page,
    trackProgram,
  }) => {
    const name = `Named Program Alpha ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName('');
    await edit.fillDescription(`Still here after empty name attempt ${uniqueSuffix()}`);

    if (await edit.saveButton.isDisabled()) {
      await expect(edit.saveButton).toBeDisabled();
      await expect(programs.programText(name).first()).toBeVisible();
      return;
    }

    await edit.save();
    await expect(edit.programNameInput).toBeVisible();
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-007 — Canceling edit does not persist Should Not Persist 42 as the name for Web Development 2026', async ({
    page,
    trackProgram,
  }) => {
    const name = `Web Development 2026 ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(`Should Not Persist 42 ${uniqueSuffix()}`);
    await edit.fillDescription('Discard me');
    await edit.cancel();

    await expect(edit.programNameInput).toBeHidden({ timeout: 10_000 });
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-008 — Failed update API does not show Ghost Edit Name without confirmed success', async ({
    page,
    trackProgram,
  }) => {
    const name = `Beta Program ${uniqueSuffix()}`;
    const ghostName = `Ghost Edit Name ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;
    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);

    const updateRoute = /\/api\/programs\/[^/]+$/;
    await page.route(updateRoute, async (route) => {
      const method = route.request().method();
      if (method === 'PUT' || method === 'PATCH') {
        await route.fulfill({ status: 503, contentType: 'text/plain', body: 'Service Unavailable' });
        return;
      }
      await route.continue();
    });

    try {
      await edit.fillProgramName(ghostName);
      const updateResponse = waitForProgramUpdateResponse(page);
      await edit.save();
      const response = await updateResponse;
      expect(response.status()).toBe(503);

      await expect(programs.textContaining(/error|failed|unavailable|wrong/i).first()).toBeVisible({
        timeout: 10_000,
      });
      await expect(edit.programNameInput).toBeVisible();
      await expect(programs.programText(ghostName)).toHaveCount(0);
      await expect(programs.programText(name).first()).toBeVisible();
    } finally {
      await page.unroute(updateRoute);
    }
  });

  test('TC-009 — Non-admin does not persist Unauthorized Edit 001 via edit UI', async () => {
    test.skip(true, 'No non-admin role in current fixture setup.');
  });

  test('TC-010 — Name / Program Name あ with Description Min name on edit follows min-length rules', async ({
    page,
    trackProgram,
  }) => {
    const baseName = `Unicode Edit Base ${uniqueSuffix()}`;
    const minName = 'あ';
    const minDesc = `Min name ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, baseName, `Start ${uniqueSuffix()}`);
    await programs.openEditForProgram(baseName);
    await edit.fillProgramName(minName);
    await edit.fillDescription(minDesc);

    if (await edit.saveButton.isDisabled()) {
      await expect(edit.saveButton).toBeDisabled();
      await expect(programs.programText(baseName).first()).toBeVisible();
      return;
    }

    await edit.save();
    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(minName).first()).toBeVisible();
    await expect(programs.textContaining(minDesc).first()).toBeVisible();
  });

  test('TC-011 — Name / Program Name of exactly N characters with Description Boundary edit N saves or is constrained', async () => {
    test.skip(true, 'Maximum name length N is not documented in the app or API.');
  });

  test('TC-012 — Renaming Gamma Program to Web Development 2026 when that name exists follows duplicate rules', async ({
    page,
    trackProgram,
  }) => {
    test.fail(true, 'Known demo bug — duplicate program names are allowed on rename.');

    const existing = `Web Development 2026 ${uniqueSuffix()}`;
    const gamma = `Gamma Program ${uniqueSuffix()}`;
    const collisionDesc = `Collision test ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;
    const duplicateError = programs.newProgramModal.duplicateErrorMessage;

    await createProgramTracked(page, trackProgram, existing, `Existing ${uniqueSuffix()}`);
    await createProgramTracked(page, trackProgram, gamma, `Gamma desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(gamma);
    await edit.fillProgramName(existing);
    await edit.fillDescription(collisionDesc);
    await edit.save();

    await expect(duplicateError).toBeVisible({ timeout: 10_000 });
    await expect(programs.programText(gamma).first()).toBeVisible();
    await expect(programs.programRow(existing)).toHaveCount(1);
  });

  test('TC-013 — Name Inżynieria & Robotyka — 日本語 and Description Symbols persist without XSS or encoding loss', async ({
    page,
    trackProgram,
  }) => {
    const baseName = `Unicode Edit Base ${uniqueSuffix()}`;
    const newName = `Inżynieria & Robotyka — 日本語 ${uniqueSuffix()}`;
    const newDesc = `Symbols: < > " ' & © ™ ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, baseName, `Start ${uniqueSuffix()}`);
    await programs.openEditForProgram(baseName);
    await edit.fillProgramName(newName);
    await edit.fillDescription(newDesc);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(newName).first()).toBeVisible();

    await programs.openEditForProgram(newName);
    await expect(edit.descriptionInput).toHaveValue(newDesc);
  });

  test('TC-014 — Multiline Description Line1 / Line2 / Line3 for Multiline Edit Program is stored consistently', async ({
    page,
    trackProgram,
  }) => {
    const name = `Multiline Edit Program ${uniqueSuffix()}`;
    const multilineDesc = ['Line1', 'Line2', 'Line3'].join('\n');
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Start ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillDescription(multilineDesc);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await programs.openEditForProgram(name);
    await expect(edit.descriptionInput).toHaveValue(multilineDesc);
  });

  test('TC-015 — Double-click Save when renaming to Double Save Edit applies only one persisted update', async ({
    page,
    trackProgram,
  }) => {
    const name = `Delta Program ${uniqueSuffix()}`;
    const updated = `Double Save Edit ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Once ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(updated);

    const firstUpdate = waitForProgramUpdateResponse(page);
    await edit.saveButton.dblclick();
    await firstUpdate;
    await waitForProgramUpdateResponse(page).catch(() => null);

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programRow(updated)).toHaveCount(1);
    await expect(programs.programText(name)).toHaveCount(0);
  });

  test('TC-016 — Description <img src=x onerror=alert(1)> on Security XSS Edit Base does not execute when rendered', async ({
    page,
    trackProgram,
  }) => {
    const name = `Security XSS Edit Base ${uniqueSuffix()}`;
    const xss = '<img src=x onerror=alert(1)>';
    let dialogSeen = false;
    page.on('dialog', (d) => {
      dialogSeen = true;
      void d.dismiss();
    });

    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Safe ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillDescription(xss);
    await edit.save();
    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });

    await programs.goto();
    expect(dialogSeen).toBe(false);
    await expect(programs.textContaining(xss).first()).toBeVisible();
  });
});
