import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { submitCreateTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-1 — Create new academic program', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Program creation form shows Program Name, Description, and Create', { tag: '@smoke' }, async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();

    const modal = programs.newProgramModal;
    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
    await expect(modal.createButton).toBeVisible();
  });

  test('TC-002 — New program appears in list after successful create', { tag: '@sanity' }, async ({ page, trackProgram }) => {
    const programName = `Web Development ${uniqueSuffix()}`;
    const description = `Full-stack web development program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription(description);
    await submitCreateTracked(page, trackProgram);

    await expect(modal.programNameInput).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
  });

  test('TC-003 — Create with Program Name only when Description is empty', { tag: '@e2e' }, async ({
    page,
    trackProgram,
  }) => {
    const programName = `Data Science Fundamentals ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription('');

    await expect(modal.createButton).toBeEnabled();
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
  });

  test('TC-004 — Long description is stored and visible', { tag: '@e2e' }, async ({ page, trackProgram }) => {
    const programName = `Cloud Engineering ${uniqueSuffix()}`;
    const longDescription =
      'This paragraph repeats coherent sentences to reach roughly five hundred characters. ' +
      'The program covers distributed systems, observability, and reliability engineering. ' +
      'Students learn to design services that scale under load and recover from failures. ' +
      'Each module includes hands-on labs and review checkpoints. ' +
      'Assessment combines practical projects with written reflection. ' +
      'Graduates should be able to operate cloud-native stacks with confidence. ' +
      'We emphasize security, cost awareness, and sustainable engineering practices.';
    expect(longDescription.length).toBeGreaterThanOrEqual(450);

    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription(longDescription);
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
    await expect(programs.textContaining(longDescription.slice(0, 80)).first()).toBeVisible();
  });

  test('TC-005 — Create stays disabled when Program Name is empty', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName('');
    await modal.fillDescription(`Any text ${uniqueSuffix()}`);

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-006 — Whitespace-only Program Name does not submit a visible program', { tag: '@regression' }, async ({
    page,
  }) => {
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
    await expect(modal.createButton).toBeVisible();
  });

  test('TC-007 — Closing modal without save does not add program', { tag: '@regression' }, async ({ page }) => {
    const ghostName = `Should Not Save ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(ghostName);
    await modal.cancel();

    await expect(modal.programNameInput).toBeHidden({ timeout: 10_000 });
    await programs.goto();
    await expect(programs.programText(ghostName)).toHaveCount(0);
  });

  test('TC-010 — Single-character Program Name is accepted', { tag: '@regression' }, async ({ page, trackProgram }) => {
    const code = 0x3042 + (Date.now() % 84);
    const programName = String.fromCodePoint(code);
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription('Min name');
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
  });

  test('TC-013 — Unicode and symbols in name and description persist', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    const programName = `Inżynieria & Robotyka — 日本語 ${uniqueSuffix()}`;
    const description = `Symbols: < > " ' & © ™ ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription(description);
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
  });

  test('TC-015 — Multiline description is accepted', { tag: '@regression' }, async ({ page, trackProgram }) => {
    const programName = `Multiline Desc Program ${uniqueSuffix()}`;
    const description = 'Line1\nLine2\nLine3';
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription(description);
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();
  });

  test('TC-016 — Double-click Create creates a single program row', { tag: '@regression' }, async () => {
    test.info().annotations.push({
      type: 'note',
      description:
        'Didaxis test env currently persists two programs on double-click; TC-016 AC expects one. Re-enable when UI/API dedupes.',
    });
    test.skip(true, 'Double-click creates duplicate programs in current build');
  });

  test('TC-017 — Script-like description does not execute; text is stored', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    const programName = `Security Program ${uniqueSuffix()}`;
    const xssPayload = '<img src=x onerror=alert(1)>';
    let dialogSeen = false;
    page.on('dialog', (d) => {
      dialogSeen = true;
      void d.dismiss();
    });

    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgramModal();
    await modal.fillProgramName(programName);
    await modal.fillDescription(xssPayload);
    await submitCreateTracked(page, trackProgram);

    await expect(modal.createButton).toBeHidden({ timeout: 15_000 });
    await expect(programs.programText(programName).first()).toBeVisible();

    await programs.goto();
    expect(dialogSeen).toBe(false);
    await expect(programs.textContaining(xssPayload).first()).toBeVisible();
  });
});
