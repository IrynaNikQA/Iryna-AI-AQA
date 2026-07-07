#!/usr/bin/env node
/**
 * afterFileEdit guard: blocks edits that weaken Playwright tests.
 * Exit 0 = allow, exit 2 = block (deny), other non-zero + failClosed = block.
 *
 * stdin JSON: { file_path, edits: [{ old_string, new_string }, ...] }
 */
'use strict';

const fs = require('fs');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isUnderTests(filePath) {
  return /(?:^|\/)tests\//.test(normalizePath(filePath));
}

function reconstructBefore(afterContent, edits) {
  let content = afterContent;
  for (let i = edits.length - 1; i >= 0; i--) {
    const { old_string: oldString, new_string: newString } = edits[i];
    if (oldString === undefined || newString === undefined) {
      throw new Error(`Edit ${i} missing old_string or new_string`);
    }
    if (newString.length > 0) {
      const idx = content.indexOf(newString);
      if (idx === -1) {
        throw new Error('Cannot reconstruct pre-edit content: new_string not found in file');
      }
      content =
        content.slice(0, idx) + oldString + content.slice(idx + newString.length);
      continue;
    }
    content = insertDeletedBlock(content, oldString);
  }
  return content;
}

function insertDeletedBlock(afterContent, deletedBlock) {
  if (!deletedBlock) {
    return afterContent;
  }

  const lines = deletedBlock.split('\n');
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) {
    return afterContent;
  }

  const first = nonEmpty[0];
  const last = nonEmpty[nonEmpty.length - 1];
  const firstIdx = deletedBlock.indexOf(first);
  const lastIdx = deletedBlock.indexOf(last) + last.length;
  const prefix = deletedBlock.slice(0, firstIdx);
  const suffix = deletedBlock.slice(lastIdx);

  if (prefix) {
    const anchor = afterContent.indexOf(prefix);
    if (anchor !== -1) {
      const insertAt = anchor + prefix.length;
      return afterContent.slice(0, insertAt) + deletedBlock.slice(prefix.length) + afterContent.slice(insertAt);
    }
  }

  if (suffix) {
    const anchor = afterContent.indexOf(suffix);
    if (anchor !== -1) {
      return afterContent.slice(0, anchor) + deletedBlock.slice(0, deletedBlock.length - suffix.length) + afterContent.slice(anchor);
    }
  }

  throw new Error('Cannot reconstruct pre-edit content: deleted block has no anchor');
}

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

function isCommentOnlyLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

function countActiveExpects(content) {
  let count = 0;
  for (const line of content.split('\n')) {
    if (isCommentOnlyLine(line)) {
      continue;
    }
    const code = stripInlineComment(line);
    const matches = code.match(/\bexpect\s*\(/g);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function hasNewlyCommentedExpect(beforeContent, afterContent) {
  const beforeActive = countActiveExpects(beforeContent);
  const afterActive = countActiveExpects(afterContent);
  if (afterActive >= beforeActive) {
    return false;
  }

  const countAllExpects = (content) => {
    let count = 0;
    for (const line of content.split('\n')) {
      const matches = line.match(/\bexpect\s*\(/g);
      if (matches) {
        count += matches.length;
      }
    }
    return count;
  };

  const beforeAll = countAllExpects(beforeContent);
  const afterAll = countAllExpects(afterContent);
  return afterAll >= beforeAll && afterActive < beforeActive;
}

function deny(reason, details) {
  const payload = {
    user_message: `Blocked: edit weakened a Playwright test (${reason}).`,
    agent_message:
      `Refusal (hard stop): do not weaken assertions to pass. ${details} ` +
      'Restore the assertion or escalate a real bug — do not delete or comment out expect().',
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(2);
}

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) {
    throw new Error('No stdin JSON received');
  }

  const input = JSON.parse(raw);
  const filePath = input.file_path;
  if (!filePath) {
    throw new Error('stdin JSON missing file_path');
  }

  if (!isUnderTests(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Edited file not found: ${filePath}`);
  }

  const afterContent = fs.readFileSync(filePath, 'utf8');
  const edits = Array.isArray(input.edits) ? input.edits : [];
  const beforeContent = reconstructBefore(afterContent, edits);

  const beforeCount = countActiveExpects(beforeContent);
  const afterCount = countActiveExpects(afterContent);

  if (afterCount < beforeCount) {
    deny(
      'fewer active expect() calls',
      `Before: ${beforeCount} expect(, after: ${afterCount}.`,
    );
  }

  if (hasNewlyCommentedExpect(beforeContent, afterContent)) {
    deny('expect() commented out', 'An expect() call was commented out in this edit.');
  }

  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err.message}\n`);
  process.exit(1);
});
