import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-5 — Program list filtering and display', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — List shows program name and description for each created program', { tag: '@smoke' }, async ({
    page,
    trackProgram,
  }) => {
    const name = `List Display ${uniqueSuffix()}`;
    const desc = `Full description for list row ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.goto();

    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining(desc).first()).toBeVisible();
  });

  test('TC-003 — Single program row shows name and description', { tag: '@e2e' }, async ({ page, trackProgram }) => {
    const name = `Single Row ${uniqueSuffix()}`;
    const desc = `Smoke test description ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.goto();

    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining(desc).first()).toBeVisible();
  });

  test('TC-009 — Special characters in name and description render in list', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    const name = `Course <Advanced> & "QA" ${uniqueSuffix()}`;
    const desc = `Symbols: < > " ' & © ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.goto();

    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining('Symbols:').first()).toBeVisible();
  });

  test('TC-010 — Unicode name and description display on Programs page', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    const name = `日本語リスト ${uniqueSuffix()}`;
    const desc = `العربية وال日本ية — test ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, desc);
    await programs.goto();

    await expect(programs.programText(name).first()).toBeVisible();
    await expect(programs.textContaining(desc).first()).toBeVisible();
  });

  test('Programs page exposes create entry point', { tag: '@smoke' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.newProgramButton).toBeVisible();
  });
});
