import fs from 'fs';
import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProgramsPage } from '../pages/programs.page';
import { AUTH_FILE } from './auth.constants';

setup('authenticate as admin', async ({ page }) => {
  setup.skip(
    !process.env.DIDAXIS_EMAIL || !process.env.DIDAXIS_PASSWORD,
    'Set DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env',
  );

  await new LoginPage(page).login(process.env.DIDAXIS_EMAIL!, process.env.DIDAXIS_PASSWORD!);

  const programs = new ProgramsPage(page);
  await programs.goto();
  await expect(programs.newProgramButton).toBeVisible({ timeout: 30_000 });

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
