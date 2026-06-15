# Test plan (structured): DS-4 — Delete program with confirmation

**Jira:** [DS-4](https://legionqaschool.atlassian.net/browse/DS-4) — *Delete program with confirmation*  
**Jira source:** `summary` and `description` via Atlassian MCP (`getJiraIssue`, site **legionqaschool**).  
**Status:** In Progress | **Priority:** Medium | **Labels:** `program-setup` | **Type:** Story

> Gherkin review artifact: **`features/DS-4.feature.md`**. Playwright spec: **`tests/ds4-delete-program.spec.ts`**.

**Story (from Jira):** As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

**UI surfaces (from ACs + app):** Programs list, **delete icon** per row (`Delete {programName}` button), **confirmation dialog** (implemented as native `window.confirm` in the demo app).

**Values from ACs:** **Test Program**; generic “a program” for cancel path.

---

## Acceptance criteria (from Jira)

### AC-1 — Delete program with confirmation

| Step | Text |
|------|------|
| Given | a program **"Test Program"** exists |
| When | I click the **delete icon** for **"Test Program"** |
| Then | I see a **confirmation dialog** |
| When | I confirm deletion |
| Then | **"Test Program"** is removed from the program list |

### AC-2 — Cancel program deletion

| Step | Text |
|------|------|
| Given | I click the **delete icon** for a program |
| When | I see the **confirmation dialog** |
| And | I click **Cancel** |
| Then | the program still exists in the list |

---

## Positive flows

### TC-001

- **ID:** TC-001  
- **Title:** After confirmation, **Test Program** no longer appears on the program list.  
- **Preconditions:** Program **Test Program** exists and is visible on **Programs**; user is **admin** with delete permission.  
- **Steps:**  
  1. Open **Programs**.  
  2. Click **delete icon** for **Test Program**.  
  3. Verify **confirmation dialog** appears.  
  4. Confirm deletion (native dialog: **OK**).  
- **Expected result:** Dialog closes; **Test Program** row is gone from the list.  
- **Priority:** High  
- **AC coverage:** AC-1  
- **Automation:** ✅ `tests/ds4-delete-program.spec.ts`

---

### TC-002

- **ID:** TC-002  
- **Title:** Dismissing delete via **Cancel** keeps the program row unchanged.  
- **Preconditions:** At least one program exists on **Programs**; user is **admin**.  
- **Steps:**  
  1. Click **delete icon** for the program.  
  2. When **confirmation dialog** appears, dismiss (native dialog: **Cancel**).  
  3. Observe the program list.  
- **Expected result:** Dialog closes; program still visible with same name.  
- **Priority:** High  
- **AC coverage:** AC-2  
- **Automation:** ✅ `tests/ds4-delete-program.spec.ts`

---

### TC-003

- **ID:** TC-003  
- **Title:** Confirmation copy references the program being deleted.  
- **Preconditions:** Two programs exist (e.g. **Test Program** and **Cloud Engineering 2026**).  
- **Steps:**  
  1. Click **delete icon** for **Test Program** only.  
  2. Read confirmation dialog message.  
- **Expected result:** Message includes **Test Program**; other program not implied as target.  
- **Priority:** Medium  
- **AC coverage:** UX extension of AC-1  
- **Automation:** ✅ `tests/ds4-delete-program.spec.ts`

---

## Negative flows

### TC-004 — User without delete permission cannot remove programs

- **Priority:** High | **AC coverage:** Authorization (gap in AC) | **Automation:** ⏭ Not automated (needs non-admin fixture)

### TC-005 — Delete API failure does not remove row without error

- **Priority:** High | **AC coverage:** Integrity (gap in AC) | **Automation:** ⏭ Not automated (needs route mock)

### TC-006 — Rapid double-click on confirm does not cause inconsistent state

- **Priority:** Medium | **AC coverage:** Idempotency (gap in AC) | **Automation:** ⏭ Not automated

### TC-007 — Concurrent edit vs delete ends in defined state

- **Priority:** Medium | **AC coverage:** Concurrency (gap in AC) | **Automation:** ⏭ Not automated (needs two sessions)

---

## Edge cases

### TC-008 — Special characters: **Informatique & IA - Niveau 2**

- **Priority:** Medium | **Automation:** ✅

### TC-009 — Very long program name in confirmation

- **Priority:** Low | **Automation:** ⏭ Not automated

### TC-010 — Keyboard **Esc** / focus trap

- **Priority:** Low | **Automation:** ⏭ Not automated (native confirm: limited Esc behavior)

### TC-011 — Click outside dialog / backdrop

- **Priority:** Medium | **Automation:** ⏭ N/A for native `window.confirm` (no backdrop)

### TC-012 — Delete last program in list

- **Priority:** Medium | **Automation:** ⏭ Not automated

### TC-013 — Unicode name **日本語プログラム 2026**

- **Priority:** Medium | **Automation:** ✅

### TC-014 — Pagination after delete

- **Priority:** Low | **Automation:** ⏭ Not automated

### TC-015 — Two programs named **Test Program** (if duplicates allowed)

- **Priority:** Low | **Automation:** ⏭ Not automated

---

## Traceability summary

| Jira Gherkin scenario | Test case IDs | Automated |
|-----------------------|---------------|-----------|
| **Test Program** exists → delete icon → confirmation → confirm → removed | TC-001 | ✅ |
| Delete icon → confirmation → **Cancel** → program still in list | TC-002 | ✅ |

---

## Implementation notes (from running app + spec)

1. **Dialog type:** Demo app uses **native `window.confirm`**, not a custom modal. Tests use Playwright `page.once('dialog', …)` with `accept()` / `dismiss()`.  
2. **Delete control:** Accessible name is `Delete {programName}` (see `ProgramsPage.deleteButtonFor`).  
3. **Confirm label:** Native browser **OK** / **Cancel** — not product-specific **Delete** / **Confirm** copy.  
4. **Local run:** `npx playwright test tests/ds4-delete-program.spec.ts --project=chromium-didaxis` — **5/5 passed** (plus auth setup).

---

## Ambiguities and gaps in the ACs

1. **Confirm control label** — AC says “confirm deletion” but not exact button text (**OK** vs **Delete** vs **Yes**).  
2. **Dialog type** — Not specified; demo uses native confirm (resolves TC-011 partially).  
3. **Soft delete vs hard delete** — “Removed from list” only; purge vs archive undefined.  
4. **Dependencies** — No AC for programs with courses/enrollments (blocked vs cascade).  
5. **Undo / toast** — No success or undo requirement.  
6. **Cancel AC program identity** — “A program” is generic; any existing row satisfies AC-2.  
7. **Permissions** — Not stated; delete assumed for admin only.  
8. **Concurrent users** — Not covered.  
9. **Failure handling** — Not in AC.  
10. **Boundary / special-character names** — Not in AC; covered as regression risks (TC-008, TC-009, TC-013).
