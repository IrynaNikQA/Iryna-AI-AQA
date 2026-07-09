# Eval report — suite reliability

**Repo:** IrynaNikQA/Iryna-AI-AQA  
**Report date:** 2026-07-09  
**Suite size:** 88 tagged `test()` calls across 10 specs (+ `auth.setup.ts`)  
**CI config:** `retries: 2` when `CI=true` (`.github/workflows/playwright.yml`)

> Cursor has no built-in telemetry for these metrics. Numbers below come from **CI logs**, **GitHub PR/check history** (GitHub MCP), **git history**, and **manual session review** of project agent transcripts. Re-run this report after each sprint; update the measurement notes when tooling improves.
>
> **Refresh procedure:** `.cursor/skills/suite-eval/SKILL.md` (mandatory close step in `.cursor/rules/qa-orchestrator.mdc`).

---

## 1. Flake rate

| Metric | Value |
|--------|-------|
| Tests that passed **only** on retry | **0** |
| Window | Last **1** fully parsed run (`ci-local-run.log`) + **2** PR CI check runs (PR #1, PR #2) |

**How measured**

- **Local log:** Parsed `ci-local-run.log` (58 executions, `CI=true` with retries). Searched for `Retry #1` / `Retry #2` where the same test later appears in the final **passed** set. One test (`ds3` TC-006) retried twice and **failed all attempts** — not a flake pass.
- **CI:** GitHub MCP `pull_request_read` → `get_check_runs` on PR #1 and #2. Both `Run Playwright` jobs **failed**; per-test retry/pass lines were not downloaded (check summary only). `gh run list` unavailable locally (`gh auth login` required).

**What it tells us**

Retries are not currently buying green on intermittent timing; failures are **deterministic** (locator drift during heal demos, or known app-behavior gaps). Flake may still exist — we simply have **no evidence yet** in the runs we could parse.

---

## 2. Heal success rate

| Metric | Value |
|--------|-------|
| Drift repairs completed cleanly | **3 / 3** (100%) |
| Formal heal PRs merged | **1** ([PR #1](https://github.com/IrynaNikQA/Iryna-AI-AQA/pull/1) — POM-only diff) |
| **Masked-regression count** | **0** (must stay 0) |

**How measured**

- **Git history:** Traced intentional locator breaks and fixes on `pages/dashboard.page.ts` and `pages/programs.page.ts` (`01ceb2c` → `7dfe8d0`, `6c8299f` → `21b1e63`, `21b1e63` → `99d7478`).
- **PR diff:** PR #1 `get_diff` — single line in `pages/programs.page.ts`; **no** `tests/**` changes, no removed/commented `expect()`.
- **Masked regression audit:** Grep heal commits and PR files for assertion deletion, `test.skip` added to pass, or weakened matchers. None found in heal paths. (`test.fail` on duplicate-name tests predates heals and documents **known app bugs**, not heal masking.)

| Drift event | Repair | Clean? |
|-------------|--------|--------|
| Dashboard heading `Dashboard111` | `7dfe8d0` revert | ✅ POM only |
| Programs heading `Programs111` | Fixed in `21b1e63` | ✅ POM only |
| New Program button `+ New Program111` | PR #1 / `99d7478` | ✅ POM only |

**What it tells us**

Self-heal path works for **locator drift** when triage is respected; assertion guardrails and PR #1 stayed honest. Risk is **process** (healing without triage), not observed masking.

---

## 3. Generation-gate pass rate

| Metric | Value |
|--------|-------|
| Generated specs green + conforming + maps-to-AC on **first PR** | **0 / 0** (gate not instrumented) |
| Informal agent commits (specs landed on `main` without generation PR) | **≥ 8** Cursor co-authored commits touching `tests/` |

**How measured**

- **PR history:** GitHub MCP `list_pull_requests` — **2 PRs total** (both heal/infrastructure). **Zero** PRs whose primary purpose was “new generated spec from AC.”
- **Workflow:** `.github/workflows/test-generation.yml` **does not exist**; no automated generation gate.
- **AC mapping spot-check:** `features/*.feature.md` (3 files) vs `tests/ds*.spec.ts` (8 files). DS-1, DS-4, DS-6 have traceable plans; DS-2 v2, DS-3, DS-5 expanded from `block2/` plans without a formal first-PR gate review.

**What it tells us**

Agent-authored tests reached the repo **around** conventions, but we have **no measured first-PR pass rate** — generation quality is ungated. Cannot claim a % until specs ship via a dedicated PR check (green CI + constitution hook + AC traceability comment).

---

## 4. Ask vs guess

| Metric | Value |
|--------|-------|
| Agent **asked** (blocked or used AskQuestion / explicit clarifier) | **1** |
| Agent **guessed** (proceeded with assumed/invented value) | **3** |
| Sessions reviewed | **22** parent transcripts in project `agent-transcripts/` |

**How measured**

- **Session review:** Manual scan of project agent transcripts (no `AskQuestion` tool invocations found). Counted only **clear** cases with evidence in chat.

| Type | Session | What happened |
|------|---------|----------------|
| Ask | `6c5bdfd8` | After mis-editing dashboard, agent stopped and asked how to proceed instead of pushing again. |
| Guess | `6c5bdfd8` | Re-broke `dashboard.page.ts` assuming disk ≠ git state without verifying commit history. |
| Guess | `62b34150` | Built DS-4 plan from `block2/DS-4/input.md` when Atlassian MCP was unavailable (disclosed, but ticket not fetched live). |
| Guess | `df3faa6a` | Tag heuristic (`@smoke` / `@sanity` / …) applied via script without per-test human sign-off (user requested tagging, but labels were agent-invented). |

**What it tells us**

Agents **default to action** over clarification (~3:1 guess:ask in sampled sessions). Highest risk: **repo/git state** and **AC source** assumptions. Constitution + hooks help output shape; they do not force ask-first behavior.

---

## Summary

| Dimension | Score | Confidence |
|-----------|-------|------------|
| Flake rate | 0 flaky passes (1 parsed run) | Low — need N≥20 CI log exports |
| Heal success | 3/3 clean, masked-regression **0** | High — git + PR diffs |
| Generation gate | Not measured (0 gated PRs) | N/A — gate not built |
| Ask vs guess | 1 ask / 3 guess (22 sessions) | Medium — manual coding |

---

## Top reliability risk

**CI signal is noisy and unpartitioned:** recent runs mix heal demos, `test.fail` markers for real product bugs (duplicate program names), and the full regression slice — with **retries: 2** on everything. A red `Run Playwright` does not distinguish flake, drift, known defect, or new regression without manual triage.

## Next action

1. **Short term:** On PRs, run `npm run test:smoke` only; move full `@regression` (including `test.fail` cases) to a scheduled workflow.  
2. **Measure flake properly:** Add Playwright `json` reporter artifact to CI and script: `passed on retry` / total tests over last 20 runs.  
3. **Build generation gate:** New-spec PRs must link `features/<ticket>.feature.md`, pass constitution hook, and post an AC→`test()` mapping comment before merge.

---

## Appendix — re-measurement commands

```bash
# Flake (after json reporter added)
# jq '[.suites[].specs[].tests[] | select(.results|length>1) | select(.status=="passed")]' playwright-report/results.json

# Heal PRs
gh pr list --search "heal in:head" --state all

# CI runs (requires gh auth)
gh run list --workflow=playwright.yml --limit 20
```
