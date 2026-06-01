import fs from 'fs';
import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE } from './auth.constants';
import { loginAsAdmin } from './didaxis.helpers';

setup('authenticate as admin', async ({ page }) => {
  setup.skip(
    !process.env.DIDAXIS_EMAIL || !process.env.DIDAXIS_PASSWORD,
    'Set DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env',
  );

  await loginAsAdmin(page);
  await page.goto('/programs');
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible({ timeout: 30_000 });

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
