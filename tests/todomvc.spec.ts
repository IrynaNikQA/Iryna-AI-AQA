import { expect, test } from '@playwright/test';

/** Official Playwright TodoMVC demo — aligns with `prompt template.md` test cases. @see https://demo.playwright.dev/todomvc/#/ */
const TODOMVC = 'https://demo.playwright.dev/todomvc/#/';

test.beforeEach(async ({ page }) => {
  await page.goto(TODOMVC);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

function newTodoInput(page: import('@playwright/test').Page) {
  return page.getByRole('textbox', { name: 'What needs to be done?' });
}

function todoRow(page: import('@playwright/test').Page, label: string) {
  return page.locator('.todo-list li').filter({ has: page.getByText(label, { exact: true }) });
}

test.describe('Positive flows (prompt template TC-001–TC-006)', () => {
  test('TC-001: empty list shows todos heading and new-todo entry', { tag: '@smoke' }, async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    await expect(newTodoInput(page)).toBeVisible();
    await expect(newTodoInput(page)).toHaveAttribute('placeholder', 'What needs to be done?');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-002: four distinct todos appear in order with correct counter', { tag: '@e2e' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('Buy oat milk');
    await input.press('Enter');
    await input.fill('Schedule dentist');
    await input.press('Enter');
    await input.fill('Pay electricity bill');
    await input.press('Enter');
    await input.fill('Book flight to Lisbon');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(4);
    await expect(todoRow(page, 'Buy oat milk')).toBeVisible();
    await expect(todoRow(page, 'Schedule dentist')).toBeVisible();
    await expect(todoRow(page, 'Pay electricity bill')).toBeVisible();
    await expect(todoRow(page, 'Book flight to Lisbon')).toBeVisible();
    await expect(page.getByText('4 items left')).toBeVisible();
  });

  test('TC-003: completing one item shows completed state and 3 items left', { tag: '@e2e' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const t of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await input.fill(t);
      await input.press('Enter');
    }

    const row = todoRow(page, 'Pay electricity bill');
    await row.getByRole('checkbox', { name: 'Toggle Todo' }).click();
    await expect(row).toHaveClass(/completed/);
    await expect(page.getByText('3 items left')).toBeVisible();
  });

  test('TC-004: destroy removes only the targeted row and updates count', { tag: '@e2e' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const t of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await input.fill(t);
      await input.press('Enter');
    }

    const victim = todoRow(page, 'Schedule dentist');
    await victim.hover();
    await victim.locator('.destroy').click();

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(todoRow(page, 'Schedule dentist')).toHaveCount(0);
    await expect(todoRow(page, 'Buy oat milk')).toBeVisible();
    await expect(todoRow(page, 'Pay electricity bill')).toBeVisible();
    await expect(todoRow(page, 'Book flight to Lisbon')).toBeVisible();
    await expect(page.getByText('3 items left')).toBeVisible();
  });

  test('TC-005: Mark all as complete finishes every active todo', { tag: '@e2e' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const t of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await input.fill(t);
      await input.press('Enter');
    }

    await page.getByRole('checkbox', { name: 'Mark all as complete' }).click();
    for (const label of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await expect(todoRow(page, label)).toHaveClass(/completed/);
    }
    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-006: Active filter hides completed todos', { tag: '@e2e' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const t of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await input.fill(t);
      await input.press('Enter');
    }
    await todoRow(page, 'Buy oat milk').getByRole('checkbox', { name: 'Toggle Todo' }).click();
    await todoRow(page, 'Book flight to Lisbon').getByRole('checkbox', { name: 'Toggle Todo' }).click();

    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(todoRow(page, 'Schedule dentist')).toBeVisible();
    await expect(todoRow(page, 'Pay electricity bill')).toBeVisible();
  });
});

test.describe('Negative flows (prompt template TC-007–TC-011)', () => {
  test('TC-007: whitespace-only submit does not create a row', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('   ');
    await input.press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-008: Enter on empty new-todo does not duplicate existing item', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('Buy oat milk');
    await input.press('Enter');
    await input.press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('TC-009: destroy removes only the clicked row among four', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const t of ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon']) {
      await input.fill(t);
      await input.press('Enter');
    }

    const row = todoRow(page, 'Pay electricity bill');
    await row.hover();
    await row.locator('.destroy').click();

    await expect(todoRow(page, 'Pay electricity bill')).toHaveCount(0);
    await expect(todoRow(page, 'Buy oat milk')).toBeVisible();
    await expect(todoRow(page, 'Schedule dentist')).toBeVisible();
    await expect(todoRow(page, 'Book flight to Lisbon')).toBeVisible();
  });

  test('TC-010: completing a todo keeps it visible on All', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('Buy oat milk');
    await input.press('Enter');
    const row = todoRow(page, 'Buy oat milk');
    await row.getByRole('checkbox', { name: 'Toggle Todo' }).click();
    await expect(row).toHaveClass(/completed/);
    await page.getByRole('link', { name: 'All' }).click();
    await expect(row).toBeVisible();
  });

  test('TC-011: deleted todo does not return after hard reload', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('Temp task A');
    await input.press('Enter');
    const row = todoRow(page, 'Temp task A');
    await row.hover();
    await row.locator('.destroy').click();
    await expect(todoRow(page, 'Temp task A')).toHaveCount(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(todoRow(page, 'Temp task A')).toHaveCount(0);
  });
});

test.describe('Edge cases (prompt template TC-012–TC-017)', () => {
  test('TC-012: very long single-line todo is accepted', { tag: '@regression' }, async ({ page }) => {
    const long = 'EdgeCase-'.repeat(Math.ceil(500 / 'EdgeCase-'.length)).slice(0, 500);
    const input = newTodoInput(page);
    await input.fill(long);
    await input.press('Enter');
    const row = todoRow(page, long);
    await expect(row).toBeVisible();
    await row.hover();
    await expect(row.locator('.destroy')).toBeVisible();
  });

  test('TC-013: duplicate titles create separate rows', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('Same title');
    await input.press('Enter');
    await input.fill('Same title');
    await input.press('Enter');
    await expect(page.locator('.todo-list li').filter({ hasText: 'Same title' })).toHaveCount(2);
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('TC-014: HTML-like text is shown as plain text', { tag: '@regression' }, async ({ page }) => {
    const raw = `<script>alert(1)</script> & "quotes" 'apostrophe' € 中文`;
    let dialogOpened = false;
    page.once('dialog', () => {
      dialogOpened = true;
    });
    const input = newTodoInput(page);
    await input.fill(raw);
    await input.press('Enter');
    await expect(todoRow(page, raw)).toContainText('<script>');
    expect(dialogOpened, 'script in todo must not execute').toBe(false);
  });

  test('TC-015: leading and trailing spaces are trimmed on create', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    await input.fill('  Trim me  ');
    await input.press('Enter');
    await expect(todoRow(page, 'Trim me')).toBeVisible();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('TC-016: very large input does not crash the page', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    const huge = 'x'.repeat(10_000);
    await input.fill(huge);
    await input.press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
  });

  test('TC-017: rapid short adds produce four ordered rows', { tag: '@regression' }, async ({ page }) => {
    const input = newTodoInput(page);
    for (const c of ['A', 'B', 'C', 'D']) {
      await input.fill(c);
      await input.press('Enter');
    }
    const items = page.locator('.todo-list li label');
    await expect(items).toHaveText(['A', 'B', 'C', 'D']);
    await expect(page.getByText('4 items left')).toBeVisible();
  });
});
