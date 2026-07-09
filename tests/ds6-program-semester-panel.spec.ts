import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-6 — Program semester panel selection', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Selecting a program reveals the semester panel', { tag: '@e2e' }, async ({ page, trackProgram }) => {
    const name = `Semester Panel Program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Semester panel probe ${uniqueSuffix()}`);
    await programs.goto();
    await programs.selectProgram(name);

    await expect(programs.semesterEmptyStateHint).toBeHidden();
    await expect(programs.semestersSchedulingLabel).toBeVisible();
    await expect(programs.semesterPanelTitle(name)).toBeVisible();
    await expect(programs.addSemesterButton).toBeVisible();
  });

  test('TC-002 — Switching selection updates the semester panel', { tag: '@regression' }, async ({ page, trackProgram }) => {
    const alpha = `Semester Alpha ${uniqueSuffix()}`;
    const beta = `Semester Beta ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, alpha, `Alpha desc ${uniqueSuffix()}`);
    await createProgramTracked(page, trackProgram, beta, `Beta desc ${uniqueSuffix()}`);
    await programs.goto();

    await programs.selectProgram(alpha);
    await expect(programs.semesterPanelTitle(alpha)).toBeVisible();

    await programs.selectProgram(beta);
    await expect(programs.semesterPanelTitle(beta)).toBeVisible();
    await expect(programs.semesterPanelTitle(alpha)).toBeHidden();
  });
});
