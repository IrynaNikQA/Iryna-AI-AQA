import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-4 — Delete program with confirmation', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Confirming delete removes program from the list', async ({ page, trackProgram }) => {
    const name = `Test Program ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `To delete ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await programs.openDeleteForProgram(name);

    await expect(programs.programText(name)).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-002 — Cancel leaves program in the list', async ({ page, trackProgram }) => {
    const name = `Keep Me ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Body ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.dismiss();
    });
    await programs.openDeleteForProgram(name);

    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-003 — Native confirm message references the program being deleted', async ({
    page,
    trackProgram,
  }) => {
    const a = `Alpha ${uniqueSuffix()}`;
    const b = `Beta ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, a, `Da ${uniqueSuffix()}`);
    await createProgramTracked(page, trackProgram, b, `Db ${uniqueSuffix()}`);

    const msgPromise = new Promise<string>((resolve) => {
      page.once('dialog', (d) => {
        resolve(d.message());
        void d.dismiss();
      });
    });
    await programs.openDeleteForProgram(a);
    const msg = await msgPromise;

    expect(msg).toMatch(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    await expect(programs.programRow(a)).toBeVisible();
    await expect(programs.programRow(b)).toBeVisible();
  });

  test('TC-008 — Delete program with special characters in name', async ({ page, trackProgram }) => {
    const name = `Informatique & IA - Niveau 2 ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `Spec ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await programs.openDeleteForProgram(name);

    await expect(programs.programText(name)).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-013 — Delete program with Unicode name', async ({ page, trackProgram }) => {
    const name = `日本語プログラム ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);

    await createProgramTracked(page, trackProgram, name, `D ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await programs.openDeleteForProgram(name);

    await expect(programs.programText(name)).toHaveCount(0, { timeout: 15_000 });
  });
});
