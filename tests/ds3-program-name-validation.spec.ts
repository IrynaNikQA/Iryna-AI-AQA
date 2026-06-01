import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-3 — Program name validation and duplicate prevention', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Program name with ampersand, hyphen, and accents is accepted', async ({
    page,
    trackProgram,
  }) => {
    const name = `Informatique & IA - Niveau 2 ${uniqueSuffix()}`;
    const desc = `Cycle supérieur — mathématiques et algorithmes ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, desc);
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-002 — Leading and trailing spaces trimmed on create', async ({ page, trackProgram }) => {
    const inner = `Cloud Native ${uniqueSuffix()}`;
    const padded = `  ${inner}  `;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, padded, `Desc ${uniqueSuffix()}`);
    await expect(programs.programText(inner).first()).toBeVisible();
  });

  test('TC-003 — Unicode program name is accepted', async ({ page, trackProgram }) => {
    const name = `日本語プログラム ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `説明 ${uniqueSuffix()}`);
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-004 — Whitespace-only program name does not submit', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName('   ');
    await modal.fillDescription(`Test ${uniqueSuffix()}`);

    if (await modal.createButton.isDisabled()) {
      await expect(modal.createButton).toBeDisabled();
      return;
    }
    await modal.submit();
    await expect(modal.programNameInput).toBeVisible();
  });

  test('TC-005 — Empty program name keeps Create disabled', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName('');
    await modal.fillDescription(`Any ${uniqueSuffix()}`);
    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-006 — Duplicate program name shows error and does not add row', async ({
    page,
    trackProgram,
  }) => {
    const name = `Dup Program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgramTracked(page, trackProgram, name, `First ${uniqueSuffix()}`);
    await programs.openNewProgramModal();
    await modal.fillProgramName(name);
    await modal.fillDescription(`Second ${uniqueSuffix()}`);
    await modal.submit();

    await expect(modal.duplicateErrorMessage).toBeVisible({ timeout: 10_000 });
    await expect(modal.programNameInput).toBeVisible();
  });

  test('TC-007 — Duplicate check after trim matches canonical name', async ({
    page,
    trackProgram,
  }) => {
    const name = `Trim Dup ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgramTracked(page, trackProgram, name, `A ${uniqueSuffix()}`);
    await programs.openNewProgramModal();
    await modal.fillProgramName(`  ${name}  `);
    await modal.fillDescription(`B ${uniqueSuffix()}`);
    await modal.submit();

    await expect(modal.duplicateErrorMessage).toBeVisible({ timeout: 10_000 });
  });

  test('TC-015 — SQL-like fragments in name are stored safely', async ({ page, trackProgram }) => {
    const name = `O'Brien safe name ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await expect(programs.programText(name).first()).toBeVisible();
  });
});
