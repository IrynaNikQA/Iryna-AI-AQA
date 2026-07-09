import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/programs.page';
import { createProgramTracked, uniqueSuffix } from './didaxis.helpers';

test.describe('DS-2 — Edit program accessibility', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test('TC-a11y-001 — Edit Program dialog has no wcag2a/aa violations', { tag: '@regression' }, async ({
    page,
    trackProgram,
  }) => {
    const name = `A11y Edit Target ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.openEditForProgram(name);
    await expect(edit.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include(edit.dialog)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('TC-a11y-002 — Edit flow is keyboard operable', { tag: '@regression' }, async ({ page, trackProgram }) => {
    const name = `Keyboard Edit Target ${uniqueSuffix()}`;
    const programs = new ProgramsPage(page);
    const edit = programs.editProgramModal;
    const editButton = programs.editButtonFor(name);

    await createProgramTracked(page, trackProgram, name, `Desc ${uniqueSuffix()}`);
    await programs.goto();
    await expect(editButton).toBeVisible();

    await editButton.focus();
    await expect(editButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(edit.dialog).toBeVisible();
    await expect(edit.programNameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(edit.descriptionInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(edit.saveButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(edit.cancelButton).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(edit.programNameInput).toBeHidden({ timeout: 10_000 });
    await expect(programs.programText(name).first()).toBeVisible();
  });
});
