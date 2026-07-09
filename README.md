# Iryna AI AQA

Playwright end-to-end tests for [Didaxis](https://didaxis.studio), with Cursor agents and skills for test planning, authoring, triage, and self-heal.

## Prerequisites

- **Node.js 20+**
- Access to a Didaxis test environment and credentials (see below)

## Install

```bash
git clone https://github.com/IrynaNikQA/Iryna-AI-AQA.git
cd Iryna-AI-AQA
npm ci
npx playwright install chromium
```

## Environment

```bash
cp .env.example .env
```

Edit `.env` with real values. The file is git-ignored — never commit secrets.

| Variable | Required for tests | Purpose |
|----------|-------------------|---------|
| `DIDAXIS_URL` | Yes | App base URL (`playwright.config.ts` `baseURL`) |
| `DIDAXIS_EMAIL` | Yes | Login for `tests/auth.setup.ts` |
| `DIDAXIS_PASSWORD` | Yes | Login for `tests/auth.setup.ts` |
| `DIDAXIS_API_TOKEN` | Yes | API cleanup after tests that create programs |
| `DIDAXIS_ALT_EMAIL` | No | Secondary user for permission probes |
| `DIDAXIS_ALT_PASSWORD` | No | Password for alt account |

Agent-only variables (`CURSOR_API_KEY`, `ATLASSIAN_*`) are documented in `.env.example` but are **not** needed to run Playwright locally.

## Run tests

Full suite (setup project logs in once, then Didaxis specs reuse `storageState`):

```bash
npx playwright test
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

Run a single spec:

```bash
npx playwright test tests/ds1-create-program.spec.ts
```

Run a tagged slice (exactly one tag per `test()` — never on `describe`):

```bash
npm run test:smoke        # fast gate
npm run test:sanity       # core happy paths
npm run test:regression   # edge cases, a11y, security
npm run test:api          # API contract / mocking focus
npm run test:e2e          # full UI journeys
npm run test:destructive  # shared-state mutation only (--workers=1)
```

Tags: `@smoke` · `@sanity` · `@regression` · `@api` · `@e2e` · `@destructive`. Use `@destructive` only when a test mutates shared/global state (locale, roles, flags, settings) and add an `afterEach`/`afterAll` revert hook. Self-cleaning tests keep their importance tag (`@e2e`, etc.).

## Project layout

| Path | Role |
|------|------|
| `tests/` | Playwright specs and `auth.setup.ts` |
| `pages/` | Page Object Model — locators live here, not in specs |
| `fixtures/` | Shared test fixtures (auth, API cleanup) |
| `support/` | API helpers |
| `.cursor/rules/` | Always-on conventions (`constitution.mdc`, `playwright-conventions.mdc`) |
| `.cursor/skills/` | Task skills (Jira → Gherkin, POM, triage, self-heal, …) |
| `.cursor/agents/` | Subagents: `triage`, `test-writer`, `bug-reporter` |
| `.cursor/hooks/` | Post-edit guards that block constitution violations |

## Cursor agent setup

Open this repo in [Cursor](https://cursor.com). Project rules under `.cursor/rules/` load automatically (`constitution.mdc` is always on).

**Skills** (`.cursor/skills/`) — invoke by name or let the agent pick them up from context:

- `jira-ticket-analyzer` — acceptance criteria → Gherkin scenarios
- `test-writer` agent — plan → Playwright spec
- `ci-failure-triage` / `self-heal` — diagnose red CI, fix locator drift
- `jira-bug-reporter` / `bug-reporter` agent — file Jira bugs for real defects
- `pom-conventions`, `api-cleanup`, `program-deleter`, `explore-and-generate`

**MCP plugins** — enable **GitHub** and **Atlassian** in Cursor Settings → MCP and paste your tokens there (or use the `ATLASSIAN_*` vars from `.env` where supported). These power PR checks, Jira ticket fetch, and bug filing — they are not required for `npx playwright test`.

**CI agent** — `.github/workflows/test-generation.yml` (when present) uses `CURSOR_API_KEY` for headless agent runs. The Playwright test workflow (`.github/workflows/playwright.yml`) only needs the `DIDAXIS_*` GitHub environment variables.

## CI

Push triggers `.github/workflows/playwright.yml` on the `Dev1` environment with `DIDAXIS_*` vars. Reports are uploaded as artifacts.
