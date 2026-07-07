---
name: self-heal
description: >-
  Repairs drifted Playwright locators after a UI change — patch the POM,
  re-run the failing spec, and open a PR with the locator diff. Use when
  the build is red because a locator broke, fix the drifted selector, the
  test broke after a UI change, or heal the suite. Use ONLY after triage
  classifies the red run as a test issue (drift) — never for a real app bug.
---

# Self-Heal (Locator Drift Repair)

Fix **one** drifted locator per run. Patch the POM, prove green with
**unchanged assertions**, open a PR. Never weaken tests to get green.

## Gate — triage required

**Stop immediately** unless you have a completed triage handoff that
classifies the failure as **Test issue** (drift: wrong/stale locator,
accessible name change, DOM restructure).

| Classification | Action |
|----------------|--------|
| **Test issue** (drift) | Continue this skill |
| **App bug** | Stop. Route to `.cursor/skills/jira-bug-reporter/SKILL.md` |
| Missing / ambiguous | Stop. Run `.cursor/skills/ci-failure-triage/SKILL.md` first |

Do not self-heal from a raw red build without triage. Symptom-only fixes
mask product defects.

## Steps

### 1. Confirm drift classification

Read the triage handoff (PR comment, agent output, or local diagnosis).
Verify:

- Classification is **Test issue**, not App bug
- Root cause names a **locator / POM** problem (not missing wait, env, or AC mismatch)
- Evidence paths exist: `test-results/<folder>/trace.zip`, `error-context.md`

If classification is App bug or uncertain → **stop**, route to
jira-bug-reporter. Do not patch.

### 2. Find the failing locator and its POM

From the trace and Playwright error:

1. Open `test-results/<folder>/error-context.md` — note the page snapshot
   at failure time.
2. Open `test-results/<folder>/trace.zip` (prefer **retry1** trace in CI).
3. Identify the **exact locator** Playwright timed out on or could not resolve.
4. Trace the call stack to the **POM property or method** in `pages/` or
   `pages/components/` — not the spec.
5. Read the failing spec only to learn **which user action** led to the
   broken locator; do not edit it yet.

Record: `POM file`, `property/method`, `old locator expression`.

### 3. Re-discover the element (Playwright MCP a11y tree)

Use **cursor-ide-browser** (agent-browser). Accessibility tree only —
no screenshot guessing.

1. Auth: reuse `playwright/.auth/user.json` or sign in via MCP against
   `DIDAXIS_URL` (see `.env`).
2. `browser_navigate` to the route and UI state at the failing step
   (replay triage steps from the spec).
3. `browser_snapshot` — source of truth (role / name / ref YAML).
4. Find the target element by **role + current accessible name**:
   - Same role as the old locator (`button`, `dialog`, `textbox`, …)
   - Updated `name` if the label changed
   - Scope to parent dialog/region when the old POM scoped (see
     `.cursor/skills/pom-conventions/SKILL.md`)
5. Translate snapshot to a Playwright locator:
   `getByRole`, `getByLabel`, or `getByText` — never CSS selectors.

If the element is gone because behavior changed (not just renamed) →
**stop**. That is likely an app bug, not drift.

### 4. Patch the POM (minimal role-based diff)

Edit **only** the POM file identified in step 2.

Rules:

- **Minimal diff** — change the drifted locator expression only
- **Role-based** — `getByRole` / `getByLabel` / `getByText` per
  pom-conventions
- **Never edit spec assertions** — `expect(...)` in `tests/` stays untouched
- **Never edit waits/timeouts** in the spec to mask drift
- Do not refactor unrelated POM methods in the same PR

```typescript
// Example drift fix — name changed, role unchanged
// Before
this.createButton = dialog.getByRole('button', { name: 'Create', exact: true });
// After
this.createButton = dialog.getByRole('button', { name: 'Save program', exact: true });
```

### 5. Re-run and prove green (assertions unchanged)

```bash
npx playwright test <failing-spec-path> --project=chromium-didaxis
```

Before running, confirm the spec file has **zero diff** in assertions.

| Outcome | Action |
|---------|--------|
| Green, spec assertions unchanged | Proceed to step 6 |
| Still red | Stop. One repair per run — do not chain fixes. Escalate. |
| Green only after weakening an assertion | **Bug in this skill.** Revert assertion change, escalate. Green via weakened assertion is never acceptable. |

Optionally run `git diff tests/` — must be empty.

### 6. Report and open a PR

Every heal becomes a PR. Do not push to main without review.

**Branch:** `heal/<short-description>` (e.g. `heal/programs-create-button-name`)

**PR body template:**

```markdown
## Self-heal: locator drift

**Triage:** Test issue (drift) — [link to triage comment or run URL]
**Failed test:** `{spec} › {describe} › {test title}`
**POM:** `{path}`

### Locator diff

| | Expression |
|---|------------|
| **Old** | `{old locator}` |
| **New** | `{new locator}` |

**Role:** `{role}` — accessible name `{old name}` → `{new name}`

### Proof

- Re-run: `npx playwright test <spec> --project=chromium-didaxis` — **passed**
- Spec assertions: **unchanged** (`git diff tests/` empty)

### MCP evidence

Snapshot ref / accessible name used: `{from browser_snapshot}`
```

Post the same locator diff summary on the originating PR if the red run
came from a PR.

## Rules

- **One repair per run** — single locator, single POM file, single PR
- **Assertions are sacred** — drift fixes update locators, not expectations
- **PR always** — no direct commits to main; human merges
- **No self-triage** — if triage has not run, run ci-failure-triage first
- **No app-bug workarounds** — missing elements or wrong behavior → Jira

## Related skills

| Skill | When |
|-------|------|
| ci-failure-triage | No drift classification yet |
| jira-bug-reporter | Triage says App bug |
| pom-conventions | Locator style and Didaxis inventory |

## Escalate to human when

- Element not found in a11y tree after replaying failing steps
- Multiple locators broke in one test (scope > one repair)
- Fix requires changing an assertion to pass
- Same locator drifts again on a second heal attempt
