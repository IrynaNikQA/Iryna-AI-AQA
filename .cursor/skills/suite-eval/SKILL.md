---
name: suite-eval
description: >-
  Updates eval-report.md with suite reliability metrics (flake rate, heal
  success, generation-gate pass, ask-vs-guess). Use as the mandatory closing
  step after any orchestrated QA task (ticket done, heal PR opened, triage
  posted, or generation PR merged) and when the user asks for a reliability
  report or eval refresh. Cursor has no built-in telemetry — measure from CI
  logs, PR history, git, and session review.
---

# Suite Eval

Refresh `eval-report.md` at the **end** of orchestrated QA work. Do not skip
because numbers are incomplete — record what you measured and mark confidence.

## When (mandatory)

Run after **any** of:

- Ticket path: spec green + committed (or PR opened)
- Heal path: repair PR opened with POM-only diff
- Bug path: Jira bug filed and linked
- Generation: new `tests/*.spec.ts` landed via PR or commit
- User requests "eval", "reliability report", or "refresh metrics"

Skip only for read-only questions with no suite impact.

## Steps

1. **Read** current `eval-report.md` — keep section structure; bump report date.
2. **Flake rate** — last N CI runs (default N=20, or all available):
   - `gh run list --workflow=playwright.yml --limit N` + download logs or
     `playwright-report` artifact; or GitHub MCP `get_check_runs` per PR.
   - Count tests that **passed only on retry** (Playwright `Retry #1` in log
     then pass, or JSON reporter `results.length > 1` + final passed).
   - Record: `flake_count / total_test_executions` or `0 / N runs parsed`.
3. **Heal success rate** — since last eval or last 30 days:
   - `gh pr list --search "heal in:head"` or git log on `pages/**`.
   - **Clean heal:** POM-only diff, `git diff tests/` empty, no removed
     `expect(`. Count `clean / total` drift repairs.
   - **Masked-regression count:** heals that weakened/deleted assertions or
     added `test.skip` to pass — **must be 0**. Escalate if not.
4. **Generation-gate pass rate** — PRs whose primary deliverable is a new spec:
   - Green CI on first PR push + constitution hook clean + AC mapping comment
     or `features/<ticket>.feature.md` link in PR body.
   - `passed_first_pr / total_generation_prs` (0/0 if gate not built — say so).
5. **Ask vs guess** — review current session (+ prior if cited):
   - **Ask:** blocked on missing input, used AskQuestion, or explicit clarifier.
   - **Guess:** invented URL/credential/locator/tag/AC without verification.
   - Count each with one-line evidence (session id or chat turn).
6. **Write** `eval-report.md` — for each metric: number, how measured, one-line
   insight. Update **Top reliability risk** and **Next action**.
7. **Tell the user** eval was updated and quote the top risk + next action.

## Output format

Preserve the four sections + Summary table + Top risk / Next action in
`eval-report.md`. Do not create a separate file unless the user asks.

## Rules

- Never fabricate metrics — use `N/A` or `0 / 0 (not instrumented)` with reason.
- Masked-regression count **must** be called out explicitly every run.
- If `gh` is not authed, say so in **How measured** and use MCP/local logs.
