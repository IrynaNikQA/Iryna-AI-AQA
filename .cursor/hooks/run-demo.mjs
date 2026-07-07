#!/usr/bin/env node
/**
 * Simulates afterFileEdit stdin for block-weakened-test.js:
 * 1) heal that deletes an assertion → exit 2
 * 2) heal that only changes a locator → exit 0
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hookScript = path.join(__dirname, 'block-weakened-test.js');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-hook-demo-'));
const demoFile = path.join(tmpRoot, 'tests', 'demo.spec.ts');

const baseSpec = `import { expect, test } from '@playwright/test';

test('list row is visible', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: 'New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
});
`;

fs.mkdirSync(path.dirname(demoFile), { recursive: true });
fs.writeFileSync(demoFile, baseSpec, 'utf8');

function runHook(label, afterContent, edits) {
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

runHook('BLOCK: heal deletes an assertion', healDeleteAssertion, [
  {
    old_string:
      "  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();\n",
    new_string: '',
  },
]);

runHook('ALLOW: heal only changes a locator', healLocatorOnly, [
  {
    old_string: "getByRole('button', { name: 'New Program' })",
    new_string: "getByRole('button', { name: 'Create program' })",
  },
]);

fs.rmSync(tmpRoot, { recursive: true, force: true });
