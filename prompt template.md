# Prompt: Test plan for TODO MVC Application

Use the sections below as the instruction block when generating or reviewing a test plan.

---

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the TODO MVC Application.

## Acceptance Criteria

All features should be covered:

1. Create TODO list
2. Add items (4)
3. Finish item, expect to be finished
4. Remove item from the list, expect to be removed

## Requirements for the test plan

- Cover every AC with at least one test case
- Add edge cases the ACs don't mention  
  (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as:
  - ID (TC-001, TC-002, etc.)
  - Title (expected behavior, not action)
  - Preconditions
  - Steps (numbered)
  - Expected result
  - Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs

---

# Sample test plan (TodoMVC-style application)

**Assumed UI** (common TodoMVC implementation): page title **"todos"**, main text field **"What needs to be done?"** (placeholder), **toggle-all** checkbox above the list, each row has **item checkbox**, **item label**, **destroy** control (×); footer shows **"X item(s) left"**, links **All**, **Active**, **Completed**, and **Clear completed** when applicable.

## Positive flows

### TC-001

- **Title:** New user sees an empty TODO list with the correct entry point
- **Preconditions:** Browser cache cleared or first visit; TodoMVC app URL loaded (e.g. `https://todomvc.com/examples/vanillajs/` or your deployed instance).
- **Steps:**
  1. Open the TodoMVC application URL.
  2. Observe the main heading and the new-todo input.
  3. Confirm no todo rows are visible in the main list area.
- **Expected result:** Heading **"todos"** is visible; input with placeholder **"What needs to be done?"** is focused or visible; list is empty; footer filters are hidden or not shown until items exist (per implementation).
- **Priority:** High  
- **Maps to AC:** 1 — Create TODO list

### TC-002

- **Title:** Four distinct todos appear in the list after sequential entry
- **Preconditions:** Empty list (TC-001 state).
- **Steps:**
  1. Click the new-todo field **"What needs to be done?"**.
  2. Type `Buy oat milk`, press **Enter**.
  3. Type `Schedule dentist`, press **Enter**.
  4. Type `Pay electricity bill`, press **Enter**.
  5. Type `Book flight to Lisbon`, press **Enter**.
- **Expected result:** Four rows appear in order; each label matches exactly; counter shows **4 items left** (or singular **1 item left** only when one item remains—here **4 items left**).
- **Priority:** High  
- **Maps to AC:** 2 — Add items (4)

### TC-003

- **Title:** Marking one item complete shows completed styling and updates the active count
- **Preconditions:** List contains the four items from TC-002; all are active (unchecked).
- **Steps:**
  1. Click the checkbox for the row **Pay electricity bill**.
  2. Observe the row styling (e.g. strikethrough on label).
  3. Read the footer **items left** text.
- **Expected result:** **Pay electricity bill** appears completed (strikethrough / muted); **3 items left** is shown; item remains in list when **All** is selected.
- **Priority:** High  
- **Maps to AC:** 3 — Finish item, expect to be finished

### TC-004

- **Title:** Removing one item leaves the other three unchanged and updates the count
- **Preconditions:** Same list as TC-002 (four items); optionally mix completed/active per prior tests.
- **Steps:**
  1. Hover the row **Schedule dentist** until the **destroy** (×) control is visible (if hover-revealed).
  2. Click **destroy** for **Schedule dentist**.
  3. Verify remaining labels and order.
- **Expected result:** **Schedule dentist** is gone; **Buy oat milk**, **Pay electricity bill**, **Book flight to Lisbon** remain in original relative order; counter reflects three remaining todos (adjusted for any completed items per rules).
- **Priority:** High  
- **Maps to AC:** 4 — Remove item from the list, expect to be removed

### TC-005

- **Title:** Toggle-all marks every visible item complete in one action
- **Preconditions:** Four active items in the list.
- **Steps:**
  1. Click the **toggle-all** checkbox at the top of the list.
  2. Observe all four rows.
- **Expected result:** All four items show completed state; **0 items left** (or equivalent); **Clear completed** appears if implemented.
- **Priority:** Medium  
- **Maps to AC:** 3 (extended positive)

### TC-006

- **Title:** Filter **Active** shows only incomplete items after partial completion
- **Preconditions:** Four items; mark **Buy oat milk** and **Book flight to Lisbon** complete; leave two active.
- **Steps:**
  1. Click footer link **Active**.
  2. Count visible rows.
- **Expected result:** Only the two incomplete items are listed; completed items are hidden until **All** or **Completed** is selected.
- **Priority:** Medium  
- **Maps to AC:** 2 / 3 (supporting flows)

---

## Negative flows

### TC-007

- **Title:** Submitting only whitespace does not create a todo row
- **Preconditions:** Empty list or any list state.
- **Steps:**
  1. Focus **"What needs to be done?"**.
  2. Type three spaces `   `.
  3. Press **Enter**.
- **Expected result:** No new row; input clears or trims; list count unchanged; no blank label row.
- **Priority:** High

### TC-008

- **Title:** Second Enter on an empty field does not duplicate the last item
- **Preconditions:** List has exactly one item **Buy oat milk**.
- **Steps:**
  1. Focus the new-todo field with the field empty.
  2. Press **Enter** twice in quick succession.
- **Expected result:** Still exactly one row **Buy oat milk**; no duplicate empty rows.
- **Priority:** Medium

### TC-009

- **Title:** Destroy control does not remove a different row than targeted
- **Preconditions:** Four items as in TC-002.
- **Steps:**
  1. Click **destroy** only on **Pay electricity bill**.
  2. Verify **Buy oat milk**, **Schedule dentist**, **Book flight to Lisbon** still exist.
- **Expected result:** Only **Pay electricity bill** is removed; no other row disappears or reorders incorrectly.
- **Priority:** High

### TC-010

- **Title:** Completing an item does not remove it from the list under default **All** view
- **Preconditions:** List contains **Buy oat milk**.
- **Steps:**
  1. Check the checkbox for **Buy oat milk**.
  2. Confirm **All** filter context (default).
- **Expected result:** Row remains visible with completed styling; item is not deleted automatically.
- **Priority:** Medium

### TC-011

- **Title:** Browser refresh does not resurrect a deleted item when using default in-memory store
- **Preconditions:** Implementation uses in-memory storage (default TodoMVC demo).
- **Steps:**
  1. Add **Temp task A**, remove it via **destroy**.
  2. Hard refresh the page (**Ctrl+Shift+R**).
- **Expected result:** **Temp task A** does not reappear (note: if product uses persistence, expected result changes to “still deleted”—document per build).
- **Priority:** Low

---

## Edge cases

### TC-012

- **Title:** Very long single-line title is handled without breaking layout or losing text
- **Preconditions:** Empty list.
- **Steps:**
  1. Paste a 500-character string (e.g. repeat `EdgeCase-` until length 500) into **"What needs to be done?"**.
  2. Press **Enter**.
- **Expected result:** One row is created; full text is stored and visible or scrollable per design; no console error; destroy still works.
- **Priority:** Medium

### TC-013

- **Title:** Duplicate titles are allowed as separate todos
- **Preconditions:** Empty list.
- **Steps:**
  1. Add `Same title` and press **Enter**.
  2. Add `Same title` again and press **Enter**.
- **Expected result:** Two rows both labeled **Same title**; each checkbox toggles only its own row; **2 items left**.
- **Priority:** Medium

### TC-014

- **Title:** Special characters and HTML-like text render as plain text, not as HTML
- **Preconditions:** Empty list.
- **Steps:**
  1. Add `<script>alert(1)</script> & "quotes" 'apostrophe' € 中文` and press **Enter**.
- **Expected result:** Label shows literal characters; no script execution; no broken markup in the list row.
- **Priority:** High

### TC-015

- **Title:** Leading and trailing spaces are trimmed (or consistently preserved) on create
- **Preconditions:** Empty list.
- **Steps:**
  1. Enter `  Trim me  ` in the new-todo field and press **Enter**.
- **Expected result:** Behavior matches product rule: either label **Trim me** (trimmed) or exact spaces (document as defect if inconsistent with TC-007).
- **Priority:** Medium

### TC-016

- **Title:** Maximum practical input length boundary (browser / app limit)
- **Preconditions:** Empty list.
- **Steps:**
  1. Attempt to paste or type **10 000** characters into the new-todo field.
  2. Press **Enter**.
- **Expected result:** App either accepts with graceful UI, truncates with notice, or rejects with clear behavior—no crash, no silent data loss without specification.
- **Priority:** Low

### TC-017

- **Title:** Rapidly adding four items matches adding them slowly
- **Preconditions:** Empty list.
- **Steps:**
  1. Quickly type `A`, **Enter**, `B`, **Enter**, `C`, **Enter**, `D`, **Enter** with minimal delay between keys.
- **Expected result:** Exactly four rows **A**, **B**, **C**, **D** in order; count **4 items left**.
- **Priority:** Low

---

## Ambiguities or gaps in the ACs

1. **“Create TODO list”** does not specify whether the list is created on first navigation, on first successful add, or after a named user action; persistence (localStorage vs in-memory) is unspecified.
2. **“Add items (4)”** does not state whether the four items must be unique, sequential, or can include duplicates; no requirement for order or editing after add.
3. **“Finish item”** does not define UI semantics: strikethrough only vs hidden under **Active** filter; interaction with **Clear completed** and **toggle-all** is out of scope but affects verification.
4. **“Remove item”** does not specify **destroy** vs **Clear completed** vs bulk delete; expected behavior when removing the last item (footer visibility) is not stated.
5. **Accessibility, mobile layout, keyboard-only use, and concurrency** (two tabs open) are not covered by the ACs.
6. **Typo in AC:** “expact” / “ne” should read **expect** / **be** for formal specs; align test docs with corrected wording.
