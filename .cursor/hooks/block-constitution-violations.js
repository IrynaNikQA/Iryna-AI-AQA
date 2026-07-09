#!/usr/bin/env node
/**
 * afterFileEdit guard: blocks edits that introduce constitution WON'T violations.
 * Exit 0 = allow, exit 2 = block (deny), other non-zero + failClosed = block.
 *
 * stdin JSON: { file_path, edits: [{ old_string, new_string }, ...] }
 * Scope: tests/** and pages/** only (filtered here; hooks.json matcher is tool type "Write").
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

function isGuardedPath(filePath) {
  const normalized = normalizePath(filePath);
  return /(?:^|\/)tests\//.test(normalized) || /(?:^|\/)pages\//.test(normalized);
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

function activeCodeLines(content) {
  const lines = [];
  for (const line of content.split('\n')) {
    if (isCommentOnlyLine(line)) {
      continue;
    }
    lines.push(stripInlineComment(line));
  }
  return lines;
}

function countPattern(content, pattern) {
  let count = 0;
  for (const line of activeCodeLines(content)) {
    const matches = line.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function countActiveExpects(content) {
  return countPattern(content, /\bexpect\s*\(/g);
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

const CHECKS = [
  {
    id: 'waitForTimeout',
    label: 'waitForTimeout',
    count: (content) => countPattern(content, /\.waitForTimeout\s*\(/g),
    advice: 'Use web-first expect() instead of page.waitForTimeout().',
  },
  {
    id: 'xpath',
    label: 'XPath locator',
    count: (content) => countPattern(content, /\blocator\s*\(\s*['"`]\s*\/\/|\.locator\s*\(\s*['"`]\/\/|locator\s*\(\s*['"`]xpath|xpath\s*=/gi),
    advice: 'Use getByRole, getByLabel, or getByTestId — never XPath.',
  },
  {
    id: 'any-type',
    label: 'any type',
    count: (content) => countPattern(content, /:\s*any\b|<any>|\bas\s+any\b/g),
    advice: 'Type the value properly or use unknown with a narrow check.',
  },
  {
    id: 'hardcoded-credential',
    label: 'hardcoded credential',
    count: (content) => countHardcodedCredentials(content),
    advice: 'Use process.env (e.g. DIDAXIS_EMAIL, DIDAXIS_PASSWORD) — never inline secrets.',
  },
  {
    id: 'describe-tag',
    label: 'tag on test.describe()',
    count: (content) => countPattern(content, /\btest\.describe\s*\(\s*['"]@/g),
    advice: 'Put tags on individual test() calls, not on describe().',
  },
];

function countHardcodedCredentials(content) {
  let count = 0;
  for (const line of activeCodeLines(content)) {
    if (/process\.env/.test(line) || /from\s+['"]@/.test(line)) {
      continue;
    }
    if (/(?:password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]+['"]/i.test(line)) {
      count += 1;
      continue;
    }
    if (
      /getByLabel\s*\(\s*['"][^'"]*(?:assword|mail|sername|ecret)[^'"]*['"]\s*\)[^;\n]*\.fill\s*\(\s*['"][^'"]+['"]/i.test(
        line,
      )
    ) {
      count += 1;
      continue;
    }
    if (/\.fill\s*\(\s*['"][^'"]*@[^'"]+['"]\s*\)/.test(line)) {
      count += 1;
      continue;
    }
    if (/['"][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['"]/.test(line)) {
      count += 1;
      continue;
    }
    if (/\.login\s*\(\s*['"][^'"]+['"]/.test(line)) {
      count += 1;
    }
  }
  return count;
}

function findNewViolations(beforeContent, afterContent) {
  const found = [];

  for (const check of CHECKS) {
    const beforeCount = check.count(beforeContent);
    const afterCount = check.count(afterContent);
    if (afterCount > beforeCount) {
      found.push({
        reason: check.label,
        details: `Introduced ${afterCount - beforeCount} new occurrence(s). ${check.advice}`,
      });
    }
  }

  const beforeExpects = countActiveExpects(beforeContent);
  const afterExpects = countActiveExpects(afterContent);
  if (afterExpects < beforeExpects) {
    found.push({
      reason: 'removed/weakened expect()',
      details: `Before: ${beforeExpects} active expect(, after: ${afterExpects}. Restore the assertion or escalate a real bug.`,
    });
  } else if (hasNewlyCommentedExpect(beforeContent, afterContent)) {
    found.push({
      reason: 'removed/weakened expect()',
      details: 'An expect() call was commented out in this edit.',
    });
  }

  return found;
}

function deny(violation) {
  const payload = {
    user_message: `Blocked: edit introduced a constitution WON'T violation (${violation.reason}).`,
    agent_message:
      `Refusal (hard stop): ${violation.details} See .cursor/rules/constitution.mdc.`,
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

  if (!isGuardedPath(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Edited file not found: ${filePath}`);
  }

  const afterContent = fs.readFileSync(filePath, 'utf8');
  const edits = Array.isArray(input.edits) ? input.edits : [];
  const beforeContent = reconstructBefore(afterContent, edits);

  const violations = findNewViolations(beforeContent, afterContent);
  if (violations.length > 0) {
    deny(violations[0]);
  }

  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err.message}\n`);
  process.exit(1);
});
