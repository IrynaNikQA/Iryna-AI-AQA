import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import {
  createProgramTracked,
  programIdFromCreateResponse,
  uniqueSuffix,
  waitForProgramCreateResponse,
} from './didaxis.helpers';

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
    test.fail(true, 'Known demo bug — duplicate program names are allowed on create.');

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
    await expect(programs.programRow(name)).toHaveCount(1);
  });

  test('TC-007 — Duplicate check after trim matches canonical name', async ({
    page,
    trackProgram,
  }) => {
    test.fail(true, 'Known demo bug — duplicate program names are allowed on create.');

    const name = `Trim Dup ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgramTracked(page, trackProgram, name, `A ${uniqueSuffix()}`);
    await programs.openNewProgramModal();
    await modal.fillProgramName(`  ${name}  `);
    await modal.fillDescription(`B ${uniqueSuffix()}`);
    await modal.submit();

    await expect(modal.duplicateErrorMessage).toBeVisible({ timeout: 10_000 });
    await expect(programs.programRow(name)).toHaveCount(1);
  });

  test('TC-008 — Case sensitivity of duplicate match', async ({ page, trackProgram }) => {
    const base = `Web Development ${uniqueSuffix()}`;
    const lower = base.toLowerCase();
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgramTracked(page, trackProgram, base, `First ${uniqueSuffix()}`);
    await programs.openNewProgramModal();
    await modal.fillProgramName(lower);
    await modal.fillDescription(`Second ${uniqueSuffix()}`);

    const responsePromise = waitForProgramCreateResponse(page);
    await modal.submit();

    const createResponse = await responsePromise.catch(() => null);
    if (createResponse?.ok()) {
      const id = await programIdFromCreateResponse(createResponse);
      if (id) {
        trackProgram(id);
      }
      await expect(programs.programText(lower).first()).toBeVisible();
      return;
    }

    await expect(modal.duplicateErrorMessage).toBeVisible({ timeout: 10_000 });
  });

  test('TC-009 — Server returns duplicate while UI thought unique', async () => {
    test.skip(true, 'Requires parallel sessions or API race simulation — not automatable in UI-only flow.');
  });

  test('TC-010 — Unauthorized user cannot create or bypass validation', async () => {
    test.skip(true, 'No non-admin role or unauthenticated create flow in current fixture setup.');
  });

  test('TC-011 — Tab-only and newline program name treated as empty', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    for (const whitespaceName of ['\t\t\t', '\n\n']) {
      await programs.openNewProgramModal();
      await modal.fillProgramName(whitespaceName);
      await modal.fillDescription(`Test ${uniqueSuffix()}`);

      if (await modal.createButton.isDisabled()) {
        await expect(modal.createButton).toBeDisabled();
      } else {
        await modal.submit();
        await expect(modal.programNameInput).toBeVisible();
      }

      await modal.cancel();
    }
  });

  test('TC-012 — Single visible character name is accepted when unique', async ({
    page,
    trackProgram,
  }) => {
    const name = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-013 — Program name at maximum length boundary', async () => {
    test.skip(true, 'Maximum name length N is not documented in the app or API.');
  });

  test('TC-014 — Program name one character over maximum', async () => {
    test.skip(true, 'Maximum name length N is not documented in the app or API.');
  });

  test('TC-015 — SQL-like fragments in name are stored safely', async ({ page, trackProgram }) => {
    const name = `O'Brien'; DROP TABLE programs;-- ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-016 — HTML and script-like characters in name render safely', async ({
    page,
    trackProgram,
  }) => {
    const name = `Course <Advanced> & "Quotes" ${uniqueSuffix()}`;
    let dialogSeen = false;
    page.on('dialog', (d) => {
      dialogSeen = true;
      void d.dismiss();
    });

    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.goto();
    expect(dialogSeen).toBe(false);
    await expect(programs.programText(name).first()).toBeVisible();
  });

  test('TC-017 — Duplicate against soft-deleted or archived program', async () => {
    test.skip(true, 'Soft-delete or archive flow is not available in the demo app.');
  });

  test('TC-018 — Edit flow renaming into duplicate is blocked', async ({ page, trackProgram }) => {
    const existing = `Web Development ${uniqueSuffix()}`;
    const toRename = `Cloud Engineering ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;
    const duplicateError = programs.newProgramModal.duplicateErrorMessage;

    await createProgramTracked(page, trackProgram, existing, `Existing ${uniqueSuffix()}`);
    await createProgramTracked(page, trackProgram, toRename, `Rename target ${uniqueSuffix()}`);
    await programs.openEditForProgram(toRename);
    await edit.fillProgramName(existing);
    await edit.save();

    await expect(duplicateError).toBeVisible({ timeout: 10_000 });
    await expect(programs.programText(toRename).first()).toBeVisible();
    await expect(programs.programText(existing).first()).toBeVisible();
  });

  test('TC-019 — Double-click Create creates only one program row', async ({
    page,
    trackProgram,
  }) => {
    test.fail(true, 'Known demo bug — double-click Create can create duplicate rows.');

    const name = `Idempotent Create ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    page.on('response', (response) => {
      if (
        response.url().includes('/api/programs') &&
        response.request().method() === 'POST' &&
        response.ok()
      ) {
        void programIdFromCreateResponse(response).then((id) => {
          if (id) {
            trackProgram(id);
          }
        });
      }
    });

    await programs.openNewProgramModal();
    await modal.fillProgramName(name);
    await modal.fillDescription(`Desc ${uniqueSuffix()}`);

    const firstCreate = waitForProgramCreateResponse(page);
    await modal.createButton.dblclick();
    await firstCreate;
    await waitForProgramCreateResponse(page).catch(() => null);

    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(name)).toHaveCount(1);
  });
});
