import { expect, test } from '../fixtures/didaxis.fixture';
import {
  createProgramTracked,
  gotoPrograms,
  uniqueSuffix,
} from './didaxis.helpers';

test.describe('DS-5 — Program list filtering and display', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — List shows program name and description for each created program', async ({
    page,
    trackProgram,
  }) => {
    const name = `List Display ${uniqueSuffix()}`;
    const desc = `Full description for list row ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await gotoPrograms(page);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(desc, { exact: false }).first()).toBeVisible();
  });

  test('TC-003 — Single program row shows name and description', async ({ page, trackProgram }) => {
    const name = `Single Row ${uniqueSuffix()}`;
    const desc = `Smoke test description ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await gotoPrograms(page);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(desc, { exact: false }).first()).toBeVisible();
  });

  test('TC-009 — Special characters in name and description render in list', async ({
    page,
    trackProgram,
  }) => {
    const name = `Course <Advanced> & "QA" ${uniqueSuffix()}`;
    const desc = `Symbols: < > " ' & © ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await gotoPrograms(page);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Symbols:', { exact: false }).first()).toBeVisible();
  });

  test('TC-010 — Unicode name and description display on Programs page', async ({
    page,
    trackProgram,
  }) => {
    const name = `日本語リスト ${uniqueSuffix()}`;
    const desc = `العربية وال日本ية — test ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);

    await gotoPrograms(page);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(desc, { exact: false }).first()).toBeVisible();
  });

  test('Programs page exposes create entry point', async ({ page }) => {
    await gotoPrograms(page);
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });
});
