---
name: exploratory-charter
description: >-
  Turns a feature and a risk into a time-boxed exploratory charter and a
  findings template. Use when the user asks for an exploratory charter, session
  charter, risk-based exploration, exploratory test plan, or findings template
  before a manual session — not when Jira ACs exist (jira-ticket-analyzer) or
  when diffing coverage against specs (explore-and-generate). The thinking is
  human; this skill only keeps the format.
---

# Exploratory Charter

Produce two markdown artifacts from **feature** + **risk**. Do not invent
scenarios, run the app, or write Playwright code here — the tester supplies
judgment during the session.

## Inputs (ask if missing)

| Input | Example |
|-------|---------|
| **Feature** | Programs — create flow |
| **Risk** | Duplicate names slip through after trim |
| **Timebox** (optional) | 45 min |
| **Tester** (optional) | name or role |

## Procedure

1. Restate feature and risk in one sentence each (tester's words, not yours).
2. Fill the **Charter** template below — keep bullets short; leave `[ ]` boxes
   unchecked for the human to tick during the session.
3. Fill the **Findings** template with one empty row (tester adds rows live).
4. Save as `features/exploratory/<feature-slug>-<risk-slug>.charter.md`
   (slug: lowercase, hyphens, no spaces).

## Charter template

Copy and fill — do not rename sections:

```markdown
# Exploratory charter

| Field | Value |
|-------|-------|
| Feature | |
| Risk under probe | |
| Tester | |
| Date | |
| Timebox | |

## Mission

Probe **{feature}** with focus on **{risk}**. Discover behaviors, gaps, and
regressions a scripted case might miss.

## In scope

- [ ]
- [ ]

## Out of scope

- [ ]

## Oracles (how you'll judge "wrong")

- [ ] Matches ticket / product intent
- [ ] Consistent with similar flows elsewhere
- [ ] No data loss, silent failure, or stuck UI state
- [ ] Error copy is clear and recoverable
- [ ] (add risk-specific oracle)

## Starting points

| # | State / entry | Why |
|---|---------------|-----|
| 1 | | |
| 2 | | |

## Variations to try (human picks during session)

- [ ] Happy path once, then vary one variable at a time
- [ ] Empty / whitespace / max length / unicode / symbols
- [ ] Cancel, back, refresh, double-submit
- [ ] Slow network or failed save (if observable without code)
- [ ] (risk-specific variation)

## Notes (freeform during session)

```

## Findings template

Append below the charter in the same file:

```markdown
---

## Findings

| ID | Severity | Observation | Steps | Expected | Actual | Log / screenshot | Automation? |
|----|----------|-------------|-------|----------|--------|------------------|-------------|
| F-01 | | | | | | | Y / N / maybe |

**Severity:** `blocker` · `major` · `minor` · `question`

### Session wrap-up

- **Risk addressed?** yes / partial / no — one line why
- **Follow-ups:** ticket keys, new Gherkin (`jira-ticket-analyzer`), or
  `explore-and-generate` coverage gap
```

## Handoff

| Finding outcome | Next step |
|-----------------|-----------|
| Confirmed defect | `jira-bug-reporter` or `bug-reporter` agent |
| Missing scripted coverage | `explore-and-generate` or `test-writer` agent |
| Ticket ACs needed | `jira-ticket-analyzer` |

## Example (filled)

**Input:** Feature = Edit program modal · Risk = Save with no edits still fires API

**Mission line:** Probe **Edit program modal** with focus on **no-op Save still
calls the API**.

**Starting point row:** Logged-in admin on Programs with one existing program →
open Edit, change nothing, click Save.

**Findings row:** F-01 · `question` · Save enabled on unchanged form · … ·
Automation? **maybe** (contract test via `@api` tag).
