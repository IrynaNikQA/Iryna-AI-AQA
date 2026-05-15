import { expect, test } from '@playwright/test';
import {
  clickDeleteIconForProgram,
  createProgram,
  loginAsAdmin,
  programRow,
  uniqueSuffix,
} from './didaxis.helpers';

test.describe('DS-4 — Delete program with confirmation', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_EMAIL || !process.env.DIDAXIS_PASSWORD,
      'Set DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env',
    );
    await loginAsAdmin(page);
  });

  test('TC-001 — Confirming delete removes program from the list', async ({ page }) => {
    const name = `Test Program ${uniqueSuffix()}`;
    await createProgram(page, name, `To delete ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await clickDeleteIconForProgram(page, name);

    await expect(page.getByText(name, { exact: true })).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-002 — Cancel leaves program in the list', async ({ page }) => {
    const name = `Keep Me ${uniqueSuffix()}`;
    await createProgram(page, name, `Body ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.dismiss();
    });
    await clickDeleteIconForProgram(page, name);

    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-003 — Native confirm message references the program being deleted', async ({ page }) => {
    const a = `Alpha ${uniqueSuffix()}`;
    const b = `Beta ${uniqueSuffix()}`;
    await createProgram(page, a, `Da ${uniqueSuffix()}`);
    await createProgram(page, b, `Db ${uniqueSuffix()}`);

    const msgPromise = new Promise<string>((resolve) => {
      page.once('dialog', (d) => {
        resolve(d.message());
        void d.dismiss();
      });
    });
    await clickDeleteIconForProgram(page, a);
    const msg = await msgPromise;

    expect(msg).toMatch(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    await expect(programRow(page, a)).toBeVisible();
    await expect(programRow(page, b)).toBeVisible();
  });

  test('TC-008 — Delete program with special characters in name', async ({ page }) => {
    const name = `Informatique & IA - Niveau 2 ${uniqueSuffix()}`;
    await createProgram(page, name, `Spec ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await clickDeleteIconForProgram(page, name);

    await expect(page.getByText(name, { exact: true })).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-013 — Delete program with Unicode name', async ({ page }) => {
    const name = `日本語プログラム ${uniqueSuffix()}`;
    await createProgram(page, name, `D ${uniqueSuffix()}`);

    page.once('dialog', (d) => {
      void d.accept();
    });
    await clickDeleteIconForProgram(page, name);

    await expect(page.getByText(name, { exact: true })).toHaveCount(0, { timeout: 15_000 });
  });
});
