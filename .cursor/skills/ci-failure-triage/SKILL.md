---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the
  playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error
  and trace, cross-reference the spec, POM, and app source in the repo,
  classify real app bug vs test issue, and post a structured diagnosis
  to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI Failure Triage

## Steps
1. Pull the failed run's logs + playwright-report artifact (GitHub MCP / gh CLI).
2. Read the Playwright error: failing test, expected vs received, trace path.
3. Cross-reference: the spec, the POM, and the Didaxis source in the repo.
4. Classify: real app bug (route to a Jira bug via jira-bug-reporter) vs
   test issue (propose a patch for human review).
5. Report: post root cause, affected file, expected/actual, suggested fix,
   and evidence (trace/screenshot + run id) as a PR comment.

## Rules
- Never merge a fix automatically — propose, a human approves.
- For a real defect, reuse the jira-bug-reporter skill and link the story.
- The diagnosis must name the source location and cause, not just the symptom.

## Pull CI data

**Identify the run**

- Read `origin` remote for `owner/repo` and current branch.
- Latest run: GitHub REST `GET /repos/{owner}/{repo}/actions/runs?per_page=1`
  or `gh run list --repo owner/repo --limit 1`.
- GitHub MCP has no workflow-runs tool; use MCP for commits/PR checks, API or
  `gh` for runs, jobs, and artifacts.

**Logs**

- `gh run view <run-id> --log-failed` (preferred when `gh` is installed).
- Or fetch job steps from `GET .../actions/runs/{run_id}/jobs`.

**playwright-report artifact**

- List: `GET .../actions/runs/{run_id}/artifacts`.
- Download zip (requires auth): `GET .../actions/artifacts/{artifact_id}/zip`
  or `gh run download <run-id> -n playwright-report`.
- Extract to `ci-artifacts/extracted/`; paths inside are `playwright-report/`
  and `test-results/`.

**Read failures without opening the HTML UI**

- `test-results/<test-folder>/error-context.md` — page snapshot + assertion.
- `test-results/<test-folder>/trace.zip` — retry traces (`trace: on-first-retry`).
- `playwright-report/data/*.md` — same error context embedded in the report.

## Cross-reference map

| Layer | Where to look |
|-------|----------------|
| Spec / AC | `block2/DS-N/output.md`, `features/*.feature.md` |
| Test | `tests/dsN-*.spec.ts`, `tests/*.setup.ts` |
| POM | `pages/`, `pages/components/` |
| App source | Didaxis Studio repo (see jira-bug-reporter for path) |
| CI config | `.github/workflows/playwright.yml`, `playwright.config.ts` |

Match **expected** from spec/AC to **actual** from `error-context.md` snapshot
and trace (modal state, network responses, DOM after action).

## Classify

**Real app bug** — product behavior contradicts AC/spec; test and POM locators
are reasonable; failure is reproducible locally with `CI=true`.

**Test issue** — wrong locator, missing wait, stale assumption, env not wired
in workflow, missing `playwright install`, or test contradicts documented
product behavior.

When uncertain, reproduce locally before classifying.

## PR comment template

Post via GitHub MCP (`add_issue_comment` on PR) or `gh pr comment`:

```markdown
## CI failure triage

**Run:** [workflow name] #[run_number] — [status/conclusion]
**URL:** https://github.com/{owner}/{repo}/actions/runs/{run_id}
**Commit:** `{sha}`

### Failed test
`{spec file} › {describe} › {test title}`

### Root cause
{One sentence naming source location and cause — not just "assertion failed".}

### Expected vs actual
- **Expected:** {from spec/AC}
- **Actual:** {from error-context / trace}

### Classification
- [ ] App bug → Jira: {DS-N / ticket link or "creating via jira-bug-reporter"}
- [ ] Test issue → proposed fix below (human review required)

### Evidence
- Trace: `test-results/{folder}/trace.zip`
- Snapshot: `test-results/{folder}/error-context.md`

### Suggested fix
{Patch description or Jira next step — do not merge automatically.}
```

## Jira path

For **app bug**, read and follow `.cursor/skills/jira-bug-reporter/SKILL.md`:
check duplicates in project DS, create ticket with steps/evidence, link story
(e.g. DS-3).

## Workflow reference

This repo's Playwright workflow (`.github/workflows/playwright.yml`):

- Triggers on `push`; environment `Dev1` supplies `DIDAXIS_*` vars.
- Uploads `playwright-report/` + `test-results/` even on failure.
- CI uses `retries: 2`; read **retry1** trace for the richest failure data.
