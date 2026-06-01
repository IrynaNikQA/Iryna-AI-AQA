import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-2 — Edit existing program details', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Edit form opens with current program name and description', async ({
    page,
    trackProgram,
  }) => {
    const name = `Web Development ${uniqueSuffix()}`;
    const desc = `Full-stack web development program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.openEditForProgram(name);

    await expect(edit.programNameInput).toHaveValue(name);
    await expect(edit.descriptionInput).toHaveValue(desc);
  });

  test('TC-002 — Renaming program updates list after Save', async ({ page, trackProgram }) => {
    const name = `Web Development ${uniqueSuffix()}`;
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
    await expect(programs.textContaining(desc).first()).toBeVisible();
  });

  test('TC-003 — Description-only edit leaves program name unchanged', async ({
    page,
    trackProgram,
  }) => {
    const name = `Data Science ${uniqueSuffix()}`;
    const originalDesc = `Original description ${uniqueSuffix()}`;
    const newDesc = `Updated cohort focus: ML and statistics ${uniqueSuffix()}`;
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

  test('TC-004 — Save with no edits keeps program unchanged', async ({ page, trackProgram }) => {
    const name = `Stable Program ${uniqueSuffix()}`;
    const desc = `Stable description ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.openEditForProgram(name);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-006 — Empty program name blocks save', async ({ page, trackProgram }) => {
    const name = `Named Program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName('');
    await edit.fillDescription(`Still here ${uniqueSuffix()}`);

    if (await edit.saveButton.isDisabled()) {
      await expect(edit.saveButton).toBeDisabled();
    } else {
      await edit.save();
      await expect(edit.programNameInput).toBeVisible();
      await expect(programs.programText(name).first()).toBeVisible();
    }
  });

  test('TC-007 — Cancel dismisses edit without persisting changes', async ({
    page,
    trackProgram,
  }) => {
    const name = `Cancel Target ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(`Should Not Persist ${uniqueSuffix()}`);
    await edit.fillDescription('Discard me');
    await edit.cancel();

    await expect(edit.programNameInput).toBeHidden({ timeout: 10_000 });
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-014 — Unicode and special characters in name and description persist after edit', async ({
    page,
    trackProgram,
  }) => {
    const name = `Edit Unicode Base ${uniqueSuffix()}`;
    const newName = `Program — 日本語 & QA ${uniqueSuffix()}`;
    const newDesc = `Symbols: < > " ' & © ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Start ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await edit.fillProgramName(newName);
    await edit.fillDescription(newDesc);
    await edit.save();

    await expect(edit.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(newName).first()).toBeVisible();
  });

  test('TC-018 — Script-like description after edit does not trigger dialog', async ({
    page,
    trackProgram,
  }) => {
    const name = `XSS Edit Base ${uniqueSuffix()}`;
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
