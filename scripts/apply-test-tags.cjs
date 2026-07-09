#!/usr/bin/env node
/**
 * One-shot helper: apply { tag: '@…' } to tests/*.spec.ts.
 * Safe to re-run — skips tests that already have a tag option.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const TAGS_BY_FILE = {
  'tests/example.spec.ts': {
    'has title': '@smoke',
    'get started link goes to intro': '@smoke',
  },
  'tests/todomvc.spec.ts': {
    'TC-001:': '@smoke',
    'TC-002:': '@e2e',
    'TC-003:': '@e2e',
    'TC-004:': '@e2e',
    'TC-005:': '@e2e',
    'TC-006:': '@e2e',
    'TC-007:': '@regression',
    'TC-008:': '@regression',
    'TC-009:': '@regression',
    'TC-010:': '@regression',
    'TC-011:': '@regression',
    'TC-012:': '@regression',
    'TC-013:': '@regression',
    'TC-014:': '@regression',
    'TC-015:': '@regression',
    'TC-016:': '@regression',
    'TC-017:': '@regression',
  },
  'tests/ds1-create-program.spec.ts': {
    'TC-001': '@smoke',
    'TC-002': '@sanity',
    'TC-003': '@e2e',
    'TC-004': '@e2e',
    'TC-005': '@regression',
    'TC-006': '@regression',
    'TC-007': '@regression',
    'TC-010': '@regression',
    'TC-013': '@regression',
    'TC-015': '@regression',
    'TC-016': '@regression',
    'TC-017': '@regression',
  },
  'tests/ds2-edit-program.spec.ts': {
    'TC-001': '@smoke',
    'TC-002': '@sanity',
    'TC-003': '@e2e',
    'TC-004': '@e2e',
    'TC-006': '@regression',
    'TC-007': '@regression',
    'TC-014': '@regression',
    'TC-018': '@regression',
  },
  'tests/ds2-edit-program-v2.spec.ts': {
    'TC-001': '@smoke',
    'TC-002': '@sanity',
    'TC-003': '@e2e',
    'TC-004': '@e2e',
    'TC-005': '@e2e',
    'TC-006': '@regression',
    'TC-007': '@regression',
    'TC-008': '@api',
    'TC-009': '@regression',
    'TC-010': '@regression',
    'TC-011': '@regression',
    'TC-012': '@regression',
    'TC-013': '@regression',
    'TC-014': '@regression',
    'TC-015': '@regression',
    'TC-016': '@regression',
  },
  'tests/ds2-edit-program-a11y.spec.ts': {
    'TC-a11y-001': '@regression',
    'TC-a11y-002': '@regression',
  },
  'tests/ds3-program-name-validation.spec.ts': {
    'TC-001': '@smoke',
    'TC-002': '@sanity',
    'TC-003': '@e2e',
    'TC-004': '@regression',
    'TC-005': '@regression',
    'TC-006': '@regression',
    'TC-007': '@regression',
    'TC-008': '@regression',
    'TC-009': '@regression',
    'TC-010': '@regression',
    'TC-011': '@regression',
    'TC-012': '@regression',
    'TC-013': '@regression',
    'TC-014': '@regression',
    'TC-015': '@regression',
    'TC-016': '@regression',
    'TC-017': '@regression',
    'TC-018': '@regression',
    'TC-019': '@regression',
  },
  'tests/ds4-delete-program.spec.ts': {
    'TC-001': '@sanity',
    'TC-002': '@e2e',
    'TC-003': '@regression',
    'TC-008': '@regression',
    'TC-013': '@regression',
  },
  'tests/ds5-program-list-display.spec.ts': {
    'TC-001': '@smoke',
    'TC-003': '@e2e',
    'TC-009': '@regression',
    'TC-010': '@regression',
    'Programs page exposes create entry point': '@smoke',
  },
  'tests/ds6-program-semester-panel.spec.ts': {
    'TC-001': '@e2e',
    'TC-002': '@regression',
  },
};

function applyTags(filePath, tagByPrefix) {
  const abs = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(abs, 'utf8');
  let changed = 0;

  for (const [prefix, tag] of Object.entries(tagByPrefix)) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      `test\\('(${escaped}[^']*)',(?!\\s*\\{\\s*tag:)(\\s*async)`,
      'g',
    );
    const next = content.replace(re, `test('$1', { tag: '${tag}' },$2`);
    if (next !== content) {
      changed += 1;
      content = next;
    }
  }

  fs.writeFileSync(abs, content);
  return changed;
}

let total = 0;
for (const [file, tags] of Object.entries(TAGS_BY_FILE)) {
  const n = applyTags(file, tags);
  total += n;
  console.log(`${file}: ${n} tests tagged`);
}
console.log(`Done — ${total} tests updated.`);
