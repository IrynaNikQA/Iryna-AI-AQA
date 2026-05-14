# Test plan — TodoMVC (Playwright demo)

| Field | Value |
| --- | --- |
| **Application under test** | [React • TodoMVC — Playwright demo](https://demo.playwright.dev/todomvc/#/) |
| **Scope** | Manual / exploratory execution; aligns with acceptance criteria below |

## Acceptance criteria

1. Create TODO list  
2. Add items (4)  
3. Finish item — expect item to be finished (completed state)  
4. Remove item from the list — expect item to be removed  

## UI reference (observed on demo)

- **Page title (browser tab):** `React • TodoMVC`  
- **Main heading:** `todos`  
- **New todo field:** textbox with placeholder **What needs to be done?**  
- **Mark all as complete:** checkbox above the list (toggle all active items)  
- **Per row:** checkbox **Toggle Todo**, text label, **destroy** control (×; may appear on row hover)  
- **Footer:** `X item(s) left`, links **All**, **Active**, **Completed**; **Clear completed** button when there are completed items  

---

## Positive flows

### TC-001

- **Title:** New user sees an empty TODO list with the correct entry point  
- **Preconditions:** Open a fresh session (e.g. clear site data for `demo.playwright.dev` or use a private window).  
- **Steps:**  
  1. Open `https://demo.playwright.dev/todomvc/#/`.  
  2. Observe the main heading and the new-todo textbox.  
  3. Confirm no todo rows appear in the main list.  
- **Expected result:** Heading **todos** is visible; textbox **What needs to be done?** is visible (may be focused); list area has zero todos; footer filters are not shown until at least one todo exists.  
- **Priority:** High  
- **Maps to AC:** 1 — Create TODO list  

### TC-002

- **Title:** Four distinct todos appear in the list after sequential entry  
- **Preconditions:** Empty list (same as TC-001).  
- **Steps:**  
  1. Click the textbox **What needs to be done?**.  
  2. Type `Buy oat milk`, press **Enter**.  
  3. Type `Schedule dentist`, press **Enter**.  
  4. Type `Pay electricity bill`, press **Enter**.  
  5. Type `Book flight to Lisbon`, press **Enter**.  
- **Expected result:** Four list rows in that order; labels match exactly; footer shows **4 items left**.  
- **Priority:** High  
- **Maps to AC:** 2 — Add items (4)  

### TC-003

- **Title:** Marking one item complete shows completed styling and updates the active count  
- **Preconditions:** List contains the four items from TC-002; all rows use **Toggle Todo** unchecked (active).  
- **Steps:**  
  1. Click **Toggle Todo** for the row **Pay electricity bill**.  
  2. Observe completed styling (e.g. strikethrough on the label).  
  3. Read the footer **items left** text.  
- **Expected result:** **Pay electricity bill** is completed; footer shows **3 items left**; row still visible with **All** selected (default).  
- **Priority:** High  
- **Maps to AC:** 3 — Finish item  

### TC-004

- **Title:** Removing one item leaves the other three unchanged and updates the count  
- **Preconditions:** Same four items as TC-002 (all active is enough).  
- **Steps:**  
  1. Hover the row **Schedule dentist** until **destroy** (×) is visible.  
  2. Click **destroy** for **Schedule dentist**.  
  3. Verify remaining labels and order.  
- **Expected result:** **Schedule dentist** is removed; **Buy oat milk**, **Pay electricity bill**, **Book flight to Lisbon** remain in the same relative order; footer shows **3 items left**.  
- **Priority:** High  
- **Maps to AC:** 4 — Remove item  

### TC-005

- **Title:** Mark all as complete finishes every active todo in one action  
- **Preconditions:** Four active items in the list.  
- **Steps:**  
  1. Click the **Mark all as complete** checkbox.  
  2. Observe all four rows.  
- **Expected result:** All four items show completed state; footer **0 items left**; **Clear completed** is available.  
- **Priority:** Medium  
- **Maps to AC:** 3 (extended)  

### TC-006

- **Title:** Filter **Active** shows only incomplete items after partial completion  
- **Preconditions:** Four items; complete **Buy oat milk** and **Book flight to Lisbon**; leave **Schedule dentist** and **Pay electricity bill** active.  
- **Steps:**  
  1. Click footer link **Active**.  
  2. Count visible todo rows.  
- **Expected result:** Exactly two rows (**Schedule dentist**, **Pay electricity bill**); completed items are hidden until **All** or **Completed** is selected.  
- **Priority:** Medium  
- **Maps to AC:** 2 / 3 (supporting)  

---

## Negative flows

### TC-007

- **Title:** Submitting only whitespace does not create a todo row  
- **Preconditions:** Empty list or any list state.  
- **Steps:**  
  1. Focus **What needs to be done?**.  
  2. Type three spaces: `   `.  
  3. Press **Enter**.  
- **Expected result:** No new row; no blank label; list count unchanged.  
- **Priority:** High  

### TC-008

- **Title:** Enter on an empty new-todo field does not duplicate the existing item  
- **Preconditions:** Exactly one todo: **Buy oat milk**.  
- **Steps:**  
  1. Focus the new-todo field when it is empty.  
  2. Press **Enter** twice in quick succession.  
- **Expected result:** Still exactly one row **Buy oat milk**.  
- **Priority:** Medium  

### TC-009

- **Title:** Destroy removes only the targeted row  
- **Preconditions:** Four items as in TC-002.  
- **Steps:**  
  1. Click **destroy** only on **Pay electricity bill**.  
  2. Verify **Buy oat milk**, **Schedule dentist**, **Book flight to Lisbon** still exist.  
- **Expected result:** Only **Pay electricity bill** is removed; no incorrect row loss or order corruption.  
- **Priority:** High  

### TC-010

- **Title:** Completing an item does not remove it from the list under **All**  
- **Preconditions:** List contains **Buy oat milk**.  
- **Steps:**  
  1. Click **Toggle Todo** for **Buy oat milk**.  
  2. Ensure footer **All** is selected (default).  
- **Expected result:** Row remains visible with completed styling; item is not deleted automatically.  
- **Priority:** Medium  

### TC-011

- **Title:** After delete and full reload, deleted todo does not reappear  
- **Preconditions:** Demo uses browser storage (e.g. `localStorage`); use a clean profile or clear storage before the test if you need a strict baseline.  
- **Steps:**  
  1. Add **Temp task A**, remove it with **destroy**.  
  2. Hard reload the page (**Ctrl+Shift+R**).  
- **Expected result:** **Temp task A** does not reappear (still absent from stored state).  
- **Priority:** Low  

---

## Edge cases

### TC-012

- **Title:** Very long single-line title is handled without breaking layout or losing text  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Paste a **500**-character string (e.g. repeat `EdgeCase-` until length 500) into **What needs to be done?**.  
  2. Press **Enter**.  
- **Expected result:** One row created; text retained and readable or scrollable; **destroy** still works after hover; no obvious UI break.  
- **Priority:** Medium  

### TC-013

- **Title:** Duplicate titles are allowed as separate todos  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Add `Same title`, press **Enter**.  
  2. Add `Same title`, press **Enter**.  
- **Expected result:** Two rows labeled **Same title**; each **Toggle Todo** affects only its row; **2 items left**.  
- **Priority:** Medium  

### TC-014

- **Title:** Special characters and HTML-like text render as plain text  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Add `<script>alert(1)</script> & "quotes" 'apostrophe' € 中文`, press **Enter**.  
- **Expected result:** Label shows literal text; no script execution (no unexpected dialog); markup not interpreted as HTML in the row.  
- **Priority:** High  

### TC-015

- **Title:** Leading and trailing spaces on create follow a consistent rule  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Enter `  Trim me  ` in the new-todo field, press **Enter**.  
- **Expected result:** On this demo, label is **Trim me** (trimmed). If behavior ever differs from TC-007 (whitespace-only), record as a defect.  
- **Priority:** Medium  

### TC-016

- **Title:** Very large input (10 000 characters) does not crash the app  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Paste or type **10 000** characters into **What needs to be done?**.  
  2. Press **Enter**.  
- **Expected result:** No crash; acceptable outcomes include one created todo, truncation with visible behavior, or clear rejection — document actual behavior.  
- **Priority:** Low  

### TC-017

- **Title:** Rapidly adding four short items preserves order and count  
- **Preconditions:** Empty list.  
- **Steps:**  
  1. Quickly enter `A`, **Enter**, `B`, **Enter**, `C`, **Enter**, `D`, **Enter**.  
- **Expected result:** Four rows **A**, **B**, **C**, **D** in order; **4 items left**.  
- **Priority:** Low  

---

## Ambiguities or gaps in the ACs

1. **“Create TODO list”** — Unclear whether “list exists” means first load, first successful add, or named user action; persistence model not specified in ACs.  
2. **“Add items (4)”** — Uniqueness, ordering after edits, and duplicate handling not specified.  
3. **“Finish item”** — Does not state visibility under **Active** vs **Completed**, or interaction with **Clear completed** / **Mark all as complete**.  
4. **“Remove item”** — Does not distinguish **destroy** vs **Clear completed** vs bulk actions; empty-state footer not specified.  
5. **Non-functional scope** — Accessibility, mobile layout, keyboard-only flows, multi-tab concurrency omitted.  
6. **Original AC wording** — Use **expect** / **be** in formal documents (“expact” / “ne” were typos).  
