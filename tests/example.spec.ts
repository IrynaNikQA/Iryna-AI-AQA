import { expect, test } from '@playwright/test';

test('has title', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link goes to intro', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await page.getByRole('link', { name: 'Get started' }).click();

  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
