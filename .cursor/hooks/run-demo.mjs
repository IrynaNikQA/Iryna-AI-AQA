#!/usr/bin/env node
/**
 * Simulates afterFileEdit stdin for block-constitution-violations.js.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hookScript = path.join(__dirname, 'block-constitution-violations.js');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-hook-demo-'));

const baseSpec = `import { expect, test } from '@playwright/test';

test('list row is visible', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: 'New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
});
`;

function runHook(label, relativePath, afterContent, edits) {
  const demoFile = path.join(tmpRoot, relativePath);
  fs.mkdirSync(path.dirname(demoFile), { recursive: true });
  fs.writeFileSync(demoFile, afterContent, 'utf8');

  const payload = JSON.stringify({
    file_path: demoFile,
    edits,
    hook_event_name: 'afterFileEdit',
  });

  const result = spawnSync(process.execPath, [hookScript], {
    input: payload,
    encoding: 'utf8',
  });

  console.log(`\n=== ${label} ===`);
  console.log(`exit code: ${result.status}`);
  if (result.stdout.trim()) {
    console.log(`stdout: ${result.stdout.trim()}`);
  }
  if (result.stderr.trim()) {
    console.log(`stderr: ${result.stderr.trim()}`);
  }
}

const healDeleteAssertion = baseSpec.replace(
  "  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();\n",
  '',
);

const healLocatorOnly = baseSpec.replace(
  "getByRole('button', { name: 'New Program' })",
  "getByRole('button', { name: 'Create program' })",
);

const badTimeout = baseSpec.replace(
  "await page.goto('/programs');",
  "await page.goto('/programs');\n  await page.waitForTimeout(2000);",
);

const badCredential = baseSpec.replace(
  "await page.goto('/programs');",
  "await page.getByLabel('Password').fill('hunter2');\n  await page.goto('/programs');",
);

runHook('BLOCK: waitForTimeout introduced', 'tests/bad-timeout.spec.ts', badTimeout, [
  {
    old_string: "await page.goto('/programs');",
    new_string: "await page.goto('/programs');\n  await page.waitForTimeout(2000);",
  },
]);

runHook('BLOCK: heal deletes an assertion', 'tests/bad-heal.spec.ts', healDeleteAssertion, [
  {
    old_string:
      "  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();\n",
    new_string: '',
  },
]);

runHook('BLOCK: hardcoded credential introduced', 'tests/bad-cred.spec.ts', badCredential, [
  {
    old_string: "await page.goto('/programs');",
    new_string: "await page.getByLabel('Password').fill('hunter2');\n  await page.goto('/programs');",
  },
]);

runHook('ALLOW: heal only changes a locator', 'tests/good-heal.spec.ts', healLocatorOnly, [
  {
    old_string: "getByRole('button', { name: 'New Program' })",
    new_string: "getByRole('button', { name: 'Create program' })",
  },
]);

runHook('ALLOW: edit outside tests/pages is ignored', 'src/utils.ts', "export const x = 1 as any;\n", [
  { old_string: '', new_string: "export const x = 1 as any;\n" },
]);

fs.rmSync(tmpRoot, { recursive: true, force: true });
