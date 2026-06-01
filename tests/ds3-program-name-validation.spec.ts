import { expect, test } from '../fixtures/didaxis.fixture';
import {
  createProgramTracked,
  openNewProgramModal,
  uniqueSuffix,
} from './didaxis.helpers';

test.describe('DS-3 — Program name validation and duplicate prevention', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-001 — Program name with ampersand, hyphen, and accents is accepted', async ({
    page,
    trackProgram,
  }) => {
    const name = `Informatique & IA - Niveau 2 ${uniqueSuffix()}`;
    const desc = `Cycle supérieur — mathématiques et algorithmes ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, desc);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('TC-002 — Leading and trailing spaces trimmed on create', async ({ page, trackProgram }) => {
    const inner = `Cloud Native ${uniqueSuffix()}`;
    const padded = `  ${inner}  `;
    await createProgramTracked(page, trackProgram, padded, `Desc ${uniqueSuffix()}`);
    await expect(page.getByText(inner, { exact: true }).first()).toBeVisible();
  });

  test('TC-003 — Unicode program name is accepted', async ({ page, trackProgram }) => {
    const name = `日本語プログラム ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `説明 ${uniqueSuffix()}`);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('TC-004 — Whitespace-only program name does not submit', async ({ page }) => {
    await openNewProgramModal(page);
    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill(`Test ${uniqueSuffix()}`);

    const createBtn = page.getByRole('button', { name: 'Create' });
    if (await createBtn.isDisabled()) {
      await expect(createBtn).toBeDisabled();
      return;
    }
    await createBtn.click();
    await expect(page.getByLabel('Program Name')).toBeVisible();
  });

  test('TC-005 — Empty program name keeps Create disabled', async ({ page }) => {
    await openNewProgramModal(page);
    await page.getByLabel('Program Name').fill('');
    await page.getByLabel('Description').fill(`Any ${uniqueSuffix()}`);
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-006 — Duplicate program name shows error and does not add row', async ({
    page,
    trackProgram,
  }) => {
    const name = `Dup Program ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `First ${uniqueSuffix()}`);

    await openNewProgramModal(page);
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill(`Second ${uniqueSuffix()}`);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
      page.getByText(/already exists|duplicate|exist|taken|unique/i).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel('Program Name')).toBeVisible();
  });

  test('TC-007 — Duplicate check after trim matches canonical name', async ({
    page,
    trackProgram,
  }) => {
    const name = `Trim Dup ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `A ${uniqueSuffix()}`);

    await openNewProgramModal(page);
    await page.getByLabel('Program Name').fill(`  ${name}  `);
    await page.getByLabel('Description').fill(`B ${uniqueSuffix()}`);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
      page.getByText(/already exists|duplicate|exist|taken|unique/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('TC-015 — SQL-like fragments in name are stored safely', async ({ page, trackProgram }) => {
    const name = `O'Brien safe name ${uniqueSuffix()}`;
    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });
});
