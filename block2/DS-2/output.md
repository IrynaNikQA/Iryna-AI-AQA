# Test plan: Edit existing program details

**Feature:** Edit existing program details (from Programs list via edit control)  
**Primary surfaces:** Programs page, edit form (modal or panel), program list  
**Fields referenced in ACs:** Name, Description; edit uses **edit icon** on a program row; primary action **Save**

---

## Positive flows

### TC-001 — Edit form opens with current program data

| Attribute | Details |
|-----------|---------|
| **Title** | Edit form shows program **Name** and **Description** (and other persisted fields) matching the selected row |
| **Preconditions** | User can open **Programs**. A program named **Web Development 2026** exists with a known **Description** (e.g. `Full-stack web development program`). |
| **Steps** | 1. Open the **Programs** page.<br>2. Locate the row for **Web Development 2026**.<br>3. Click the **edit icon** for that row. |
| **Expected result** | An edit form appears. **Name** is pre-filled with `Web Development 2026`. **Description** matches stored value. Any other editable fields show current server values, not defaults. |
| **Priority** | High |
| **AC coverage** | Open program for editing |

---

### TC-002 — Renaming program updates list immediately after Save

| Attribute | Details |
|-----------|---------|
| **Title** | After save, list shows **Web Development 2026 - Updated** without full page reload (per AC “immediately”) |
| **Preconditions** | Edit form is open for **Web Development 2026** (after TC-001). |
| **Steps** | 1. Change **Name** to `Web Development 2026 - Updated`.<br>2. Leave **Description** unchanged unless the UI requires touching it.<br>3. Click **Save**. |
| **Expected result** | Edit UI closes. On the **Programs** list, the same program row now displays **Web Development 2026 - Updated**. Update is visible right away (optimistic UI acceptable if consistent with list refresh rules). **Description** unchanged from pre-edit value. |
| **Priority** | High |
| **AC coverage** | Successfully edit a program name |

---

### TC-003 — Description-only edit leaves Name unchanged

| Attribute | Details |
|-----------|---------|
| **Title** | Saving after changing only **Description** does not alter **Name** or other untouched fields |
| **Preconditions** | A program exists, e.g. **Name** `Data Science 2026`, **Description** `Original description text`. User opens edit for that program. |
| **Steps** | 1. Confirm **Name** shows `Data Science 2026`.<br>2. Change **Description** to `Updated cohort focus: ML and statistics`.<br>3. Do not change **Name**.<br>4. Click **Save**. |
| **Expected result** | Modal closes. List/detail still shows **Name** `Data Science 2026`. **Description** reflects `Updated cohort focus: ML and statistics`. No other fields (dates, status, IDs, etc.) change unless the product defines side effects. |
| **Priority** | High |
| **AC coverage** | Edit preserves unchanged fields |

---

### TC-004 — Save with no edits leaves data unchanged

| Attribute | Details |
|-----------|---------|
| **Title** | Opening edit and clicking **Save** without changes does not corrupt or clear fields |
| **Preconditions** | Program **Web Development 2026 - Updated** exists (or any stable program). Edit form open, fields unchanged. |
| **Steps** | 1. Open edit for the program.<br>2. Change nothing.<br>3. Click **Save** (or confirm if UI disables Save until dirty—then skip or document gap). |
| **Expected result** | No unintended clears; **Name** and **Description** remain as before; no duplicate row; optional success toast only if product allows no-op save. |
| **Priority** | Medium |
| **AC coverage** | Positive robustness |

---

### TC-005 — Concurrent edits: last writer wins or conflict message

| Attribute | Details |
|-----------|---------|
| **Title** | Behavior is defined when two sessions edit the same program |
| **Preconditions** | Two browsers/users with access to edit the same program; or API test with version/ETag if implemented. |
| **Steps** | 1. User A opens edit for **Web Development 2026 - Updated**.<br>2. User B opens edit for the same program, changes **Description**, saves.<br>3. User A changes **Name** to `Web Development 2026 - Concurrent`, saves. |
| **Expected result** | Product-defined: either conflict error for A with refresh prompt, or A’s save overwrites B’s change with clear outcome in list/API. No silent partial merge unless specified. |
| **Priority** | Medium |
| **AC coverage** | Beyond AC (consistency) |

---

## Negative flows

### TC-006 — Empty **Name** cannot be saved

| Attribute | Details |
|-----------|---------|
| **Title** | Clearing **Name** blocks save or shows validation; list keeps prior name |
| **Preconditions** | Edit form open for a program with non-empty **Name**. |
| **Steps** | 1. Clear **Name** (empty string).<br>2. Optionally set **Description** to `Still here`.<br>3. Attempt **Save**. |
| **Expected result** | **Save** disabled **or** inline error; modal stays open; list row unchanged. |
| **Priority** | High |
| **AC coverage** | Negative (validation not in AC but required for integrity) |

---

### TC-007 — Cancel / dismiss does not persist edits

| Attribute | Details |
|-----------|---------|
| **Title** | Closing edit without save does not update the program |
| **Preconditions** | Edit open for **Web Development 2026 - Updated** (or a uniquely named test program). |
| **Steps** | 1. Change **Name** to `Should Not Persist`.<br>2. Change **Description** to `Discard me`.<br>3. Close via **Cancel**, **X**, or **Esc** (whichever exists). |
| **Expected result** | List still shows previous **Name** and **Description**; reopening edit shows original data. |
| **Priority** | High |
| **AC coverage** | Negative (data integrity) |

---

### TC-008 — Save failure shows error and keeps context

| Attribute | Details |
|-----------|---------|
| **Title** | API/network failure on save does not claim success or drop user data silently |
| **Preconditions** | Ability to block or mock update API (4xx/5xx/timeout). Edit form open with valid changes. |
| **Steps** | 1. Change **Name** to `API Failure Rename`.<br>2. Click **Save** while update fails. |
| **Expected result** | Clear error message; form remains open with user’s edits **or** explicit recovery; list still shows old **Name** until server confirms success. |
| **Priority** | High |
| **AC coverage** | Negative vs “modal closes” on success only |

---

### TC-009 — User without edit permission cannot change programs

| Attribute | Details |
|-----------|---------|
| **Title** | Non-authorized roles cannot open edit or cannot save |
| **Preconditions** | Role that can view **Programs** but must not edit (or anonymous). Program exists. |
| **Steps** | 1. As restricted user, open **Programs**.<br>2. Attempt to use **edit icon** or direct URL to edit.<br>3. If form opens in error, attempt **Save**. |
| **Expected result** | **Edit icon** hidden/disabled **or** forbidden on open/save; no persisted changes via UI or API. |
| **Priority** | High |
| **AC coverage** | Negative (authorization) |

---

### TC-010 — Renaming to an existing program name follows product rules

| Attribute | Details |
|-----------|---------|
| **Title** | Duplicate **Name** with another program is rejected or merged per spec—not ambiguous |
| **Preconditions** | Programs **Web Development 2026 - Updated** and **Cloud Engineering 2026** exist. |
| **Steps** | 1. Edit **Cloud Engineering 2026**.<br>2. Set **Name** to `Web Development 2026 - Updated`.<br>3. Click **Save**. |
| **Expected result** | Validation or server error (e.g. unique constraint) **or** allowed duplicate with distinct IDs—must match documented rule; list shows consistent state. |
| **Priority** | Medium |
| **AC coverage** | Negative / rules clarity |

---

## Edge cases

### TC-011 — **Name** at maximum allowed length (boundary)

| Attribute | Details |
|-----------|---------|
| **Title** | **Name** of exactly **N** allowed characters saves and displays correctly |
| **Preconditions** | Known max **N** from UI or API. Edit a program’s **Name**. |
| **Steps** | 1. Set **Name** to a string of exactly **N** characters (e.g. alphanumeric).<br>2. Keep **Description** stable.<br>3. Click **Save**. |
| **Expected result** | Save succeeds; list shows full **Name** or documented truncation; no server 500. |
| **Priority** | Medium |
| **AC coverage** | Max-length |

---

### TC-012 — **Name** one character over maximum

| Attribute | Details |
|-----------|---------|
| **Title** | Over-max **Name** cannot be saved |
| **Preconditions** | Max **N** known. Edit form open. |
| **Steps** | 1. Enter **N+1** characters in **Name**.<br>2. Click **Save**. |
| **Expected result** | Validation or blocked input; no partial truncate-save without user intent. |
| **Priority** | Medium |
| **AC coverage** | Max-length |

---

### TC-013 — Whitespace-only **Name** after edit

| Attribute | Details |
|-----------|---------|
| **Title** | Spaces/tabs alone are not accepted as a valid **Name** |
| **Preconditions** | Edit form open. |
| **Steps** | 1. Set **Name** to three spaces `   `.<br>2. Click **Save**. |
| **Expected result** | Same as TC-006: blocked or error; list unchanged. |
| **Priority** | High |
| **AC coverage** | Empty / whitespace edge |

---

### TC-014 — Unicode and special characters in **Name** and **Description**

| Attribute | Details |
|-----------|---------|
| **Title** | Edited values with symbols and non-Latin scripts persist and render safely |
| **Preconditions** | Edit open for any program. |
| **Steps** | 1. Set **Name** to `Program — 日本語 & QA`.<br>2. Set **Description** to `Symbols: < > " ' & ©`.<br>3. Click **Save**. |
| **Expected result** | List shows updated **Name**; description/detail shows literal text (escaped, no script execution). |
| **Priority** | Medium |
| **AC coverage** | Special characters |

---

### TC-015 — Long **Description** (boundary)

| Attribute | Details |
|-----------|---------|
| **Title** | Very long **Description** (e.g. at product max or ~5000 chars if allowed) saves without UI breakage |
| **Preconditions** | Known description limit. |
| **Steps** | 1. Edit program; set **Description** to text of length at/near max.<br>2. Save.<br>3. Re-open edit and verify. |
| **Expected result** | Matches spec: truncated with warning, hard block, or full persist—consistent on reload. |
| **Priority** | Medium |
| **AC coverage** | Max-length |

---

### TC-016 — Multiline **Description**

| Attribute | Details |
|-----------|---------|
| **Title** | Line breaks in **Description** are preserved or normalized consistently |
| **Preconditions** | Edit form open. |
| **Steps** | 1. Set **Description** to `Line1\nLine2\nLine3`.<br>2. Save.<br>3. Re-open edit. |
| **Expected result** | Newlines match stored model; list view layout remains usable. |
| **Priority** | Low |
| **AC coverage** | Edge (formatting) |

---

### TC-017 — Rapid double-click **Save**

| Attribute | Details |
|-----------|---------|
| **Title** | Only one update is applied when **Save** is double-clicked |
| **Preconditions** | Edit open; valid change ready. |
| **Steps** | 1. Change **Name** to `Double Save Test`.<br>2. Double-click **Save** quickly. |
| **Expected result** | Single logical update; no duplicate API side effects; list shows **Double Save Test** once. |
| **Priority** | Medium |
| **AC coverage** | Edge (idempotency) |

---

### TC-018 — XSS-safe rendering after edit

| Attribute | Details |
|-----------|---------|
| **Title** | Script-like strings in **Description** do not execute after save |
| **Preconditions** | Edit form open. |
| **Steps** | 1. Set **Description** to `<img src=x onerror=alert(1)>`.<br>2. Save.<br>3. View list/detail. |
| **Expected result** | Content escaped or sanitized; no alert; stored as text when re-opened. |
| **Priority** | Medium |
| **AC coverage** | Security edge |

---

## Traceability summary

| Acceptance scenario | Test case IDs |
|---------------------|---------------|
| Open edit; list has **Web Development 2026**; edit icon; form pre-populated | TC-001 |
| Change **Name** to **Web Development 2026 - Updated**; **Save**; modal closes; list shows new name immediately | TC-002 |
| Only **Description** changed; **Name** and other fields unchanged | TC-003 |

---

## Ambiguities and gaps in the ACs

1. **Field naming** AC uses **Name**; DS-1 create flow used **Program Name**—confirm single canonical label and API field mapping.  
2. **“Other fields”** TC-003 references **Name** and **other fields** without listing them (status, code, dates, owner)—test matrix needs an authoritative field list.  
3. **“Immediately”** Not defined: optimistic UI, refetch, or websocket; clarify expected latency and stale-data behavior.  
4. **Edit icon** No AC for keyboard access, row menu alternative, or mobile layout.  
5. **Validation** No AC for empty name, max length, or duplicate names after edit (covered as gaps in test plan).  
6. **Permissions** View vs edit roles not stated; admin-only assumed in similar features but not written here.  
7. **Modal vs page** “Modal closes” assumes modal pattern; full-page edit would need equivalent “navigate back” expectation.  
8. **Concurrency / versioning** No rule for simultaneous edits or ETag conflicts (TC-005).  
9. **Cancel path** Not in AC; essential for regression (TC-007).  
10. **Partial save** If save fails mid-request, unclear whether **Name** and **Description** are atomic—document transactional behavior.
