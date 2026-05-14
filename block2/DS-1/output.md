# Test plan: Create new academic program

**Feature:** Create new academic program (modal form from Programs page)  
**Primary roles:** Admin  
**Form fields:** Program Name, Description  
**Primary actions:** `+ New Program`, `Create`

---

## Positive flows

### TC-001 — Program creation form opens with required fields

| Attribute | Details |
|-----------|---------|
| **Title** | Program creation form displays **Program Name** and **Description** after opening from Programs |
| **Preconditions** | User is logged in as **admin**. |
| **Steps** | 1. Open the **Programs** page.<br>2. Click **+ New Program**. |
| **Expected result** | A program creation form (modal or panel) is visible. It contains fields labeled **Program Name** and **Description**, and a way to submit (e.g. **Create**). |
| **Priority** | High |
| **AC coverage** | Navigate to program creation form |

---

### TC-002 — New program appears in list after successful create

| Attribute | Details |
|-----------|---------|
| **Title** | Created program **Web Development 2026** appears on the program list after submit |
| **Preconditions** | Admin is on the program creation form (same state as after TC-001). No existing row required unless your product forbids duplicates (see TC-016). |
| **Steps** | 1. In **Program Name**, enter `Web Development 2026`.<br>2. In **Description**, enter `Full-stack web development program`.<br>3. Click **Create**. |
| **Expected result** | The creation UI closes (modal dismissed or form cleared/navigated as designed). On the **Programs** list, a program named **Web Development 2026** is visible (and description is shown or reachable per product rules). |
| **Priority** | High |
| **AC coverage** | Successfully create a program |

---

### TC-003 — Create allowed with name and empty Description (if optional)

| Attribute | Details |
|-----------|---------|
| **Title** | Program is created when **Program Name** is filled and **Description** is empty |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `Data Science Fundamentals`.<br>2. Leave **Description** empty.<br>3. If **Create** is enabled, click **Create**. |
| **Expected result** | If Description is optional: create succeeds, UI closes, list shows **Data Science Fundamentals**. If Description is required: inline validation appears and create is blocked (then log as AC gap — see end). |
| **Priority** | Medium |
| **AC coverage** | Extends success path (optional field behavior not in AC) |

---

### TC-004 — Description with long but valid text saves correctly

| Attribute | Details |
|-----------|---------|
| **Title** | Long **Description** text is stored and shown without truncation errors |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `Cloud Engineering`.<br>2. Set **Description** to a coherent paragraph of ~500 characters (real sentences, no random filler).<br>3. Click **Create**. |
| **Expected result** | Program **Cloud Engineering** is created; description matches input in list/detail view (or full text in tooltip if UI truncates list). |
| **Priority** | Medium |
| **AC coverage** | Positive robustness beyond AC |

---

## Negative flows

### TC-005 — **Create** stays disabled when **Program Name** is empty

| Attribute | Details |
|-----------|---------|
| **Title** | Empty **Program Name** prevents submission via disabled **Create** |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Ensure **Program Name** is empty.<br>2. Optionally set **Description** to `Any text`.<br>3. Observe **Create**. |
| **Expected result** | **Create** is **disabled**. No program is created without explicit enable + click. |
| **Priority** | High |
| **AC coverage** | Validation prevents empty program name |

---

### TC-006 — Whitespace-only **Program Name** must not create a program

| Attribute | Details |
|-----------|---------|
| **Title** | Leading/trailing spaces alone do not count as a valid **Program Name** |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to three spaces `   ` (or tab characters if allowed in field).<br>2. Set **Description** to `Test`.<br>3. Try **Create** (or blur fields if validation is on blur). |
| **Expected result** | **Create** remains disabled **or** validation message indicates name is required; no new program row with blank/whitespace-only name. |
| **Priority** | High |
| **AC coverage** | Negative extension of name validation |

---

### TC-007 — Closing without save does not add a program

| Attribute | Details |
|-----------|---------|
| **Title** | Dismissing the form does not persist a program |
| **Preconditions** | Admin opened program creation from **Programs** via **+ New Program**. |
| **Steps** | 1. Enter **Program Name** `Should Not Save`.<br>2. Close the modal via **Cancel**, **X**, or **Esc** (whichever exists).<br>3. Re-open **+ New Program** and confirm list. |
| **Expected result** | **Should Not Save** does not appear on the list; reopening shows empty/default form. |
| **Priority** | Medium |
| **AC coverage** | Negative (data integrity) |

---

### TC-008 — Server-side validation error does not silently succeed

| Attribute | Details |
|-----------|---------|
| **Title** | Failed create shows error and keeps user in context |
| **Preconditions** | Ability to simulate API failure (dev tools block request, mock 400/409/500, or broken backend in test env). Admin on form with valid data. |
| **Steps** | 1. Fill **Program Name** `API Failure Test`.<br>2. Fill **Description** `Desc`.<br>3. Trigger **Create** while the create API fails. |
| **Expected result** | User sees a clear error message; modal does not close **or** closes with explicit failure + recovery path per UX spec; list does **not** show **API Failure Test** unless server confirmed success. |
| **Priority** | High |
| **AC coverage** | Negative (correctness vs "modal closes") |

---

### TC-009 — Unauthorized user cannot create programs

| Attribute | Details |
|-----------|---------|
| **Title** | Non-admin cannot access create flow or API succeeds only for admin |
| **Preconditions** | User logged in as a non-admin role that can still open **Programs** (if applicable), **or** only admin can open page. |
| **Steps** | 1. As non-admin, open **Programs**.<br>2. Attempt to use **+ New Program** and submit if visible.<br>3. Optionally call create endpoint directly with non-admin token in API test. |
| **Expected result** | **+ New Program** hidden **or** create blocked with forbidden message; no program persisted. |
| **Priority** | High |
| **AC coverage** | Negative (authorization) |

---

## Edge cases

### TC-010 — **Program Name** at minimum length (1 visible character)

| Attribute | Details |
|-----------|---------|
| **Title** | Single-character **Program Name** is accepted if product allows |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `A`.<br>2. Set **Description** to `Min name`.<br>3. Click **Create**. |
| **Expected result** | Consistent with product rules: either created as `A` or validation explains minimum length. |
| **Priority** | Low |

---

### TC-011 — **Program Name** at maximum allowed length

| Attribute | Details |
|-----------|---------|
| **Title** | Name at documented max length (e.g. 255 characters) is handled predictably |
| **Preconditions** | Know max from UI counter or backend (use real limit from spec). Admin on form. |
| **Steps** | 1. Set **Program Name** to a string of exactly **N** allowed characters (e.g. 255 × `x` or mixed alphanumeric).<br>2. Set **Description** to `Boundary name`.<br>3. Click **Create**. |
| **Expected result** | Create succeeds **or** UI prevents typing past max with clear feedback; list shows full name or truncated per consistent rules. |
| **Priority** | Medium |

---

### TC-012 — **Program Name** one character over maximum

| Attribute | Details |
|-----------|---------|
| **Title** | Over-max **Program Name** cannot be submitted |
| **Preconditions** | Max length **N** known. Admin on form. |
| **Steps** | 1. Enter **N+1** characters in **Program Name**.<br>2. Fill **Description** with `Over max`.<br>3. Attempt **Create**. |
| **Expected result** | **Create** disabled **or** validation error; no partial truncate-save without user consent. |
| **Priority** | Medium |

---

### TC-013 — Special characters and Unicode in **Program Name** and **Description**

| Attribute | Details |
|-----------|---------|
| **Title** | Unicode and symbols render correctly and persist |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `Inżynieria & Robotyka — 日本語`.<br>2. Set **Description** to `Symbols: < > " ' & © ™`.<br>3. Click **Create**. |
| **Expected result** | Values display correctly in list (no broken encoding, no HTML execution); stored text matches input after reload. |
| **Priority** | Medium |

---

### TC-014 — Duplicate **Program Name** behavior

| Attribute | Details |
|-----------|---------|
| **Title** | Second program with same **Program Name** as existing row follows business rules |
| **Preconditions** | List already contains **Web Development 2026** (from TC-002 or seed data). Admin on creation form. |
| **Steps** | 1. Set **Program Name** to `Web Development 2026`.<br>2. Set **Description** to `Duplicate attempt`.<br>3. Click **Create**. |
| **Expected result** | Either clear duplicate error (409-style) **or** two rows with same display name but distinct IDs (if allowed); must match product decision, not ambiguous success/failure. |
| **Priority** | Medium |

---

### TC-015 — Newline and long-line handling in **Description**

| Attribute | Details |
|-----------|---------|
| **Title** | Multiline **Description** is preserved or normalized consistently |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `Multiline Desc Program`.<br>2. Set **Description** to three lines: `Line1\nLine2\nLine3`.<br>3. Click **Create**. |
| **Expected result** | Line breaks preserved in detail view **or** normalized to spaces with documented behavior; list view does not break layout. |
| **Priority** | Low |

---

### TC-016 — Rapid double-click on **Create**

| Attribute | Details |
|-----------|---------|
| **Title** | Only one program is created when **Create** is double-clicked |
| **Preconditions** | Admin on form with valid data. |
| **Steps** | 1. Fill **Program Name** `Double Click Test`.<br>2. Fill **Description** `Once`.<br>3. Double-click **Create** quickly. |
| **Expected result** | Exactly one new program; no duplicate rows; button loading/disabled state during request. |
| **Priority** | Medium |

---

### TC-017 — XSS / script-like strings stored safely

| Attribute | Details |
|-----------|---------|
| **Title** | Script-like **Description** does not execute in browser |
| **Preconditions** | Admin on program creation form. |
| **Steps** | 1. Set **Program Name** to `Security Program`.<br>2. Set **Description** to `<img src=x onerror=alert(1)>`.<br>3. Click **Create**.<br>4. Open list/detail where description renders. |
| **Expected result** | Text is escaped or sanitized; no script execution; stored value visible as literal text if shown. |
| **Priority** | Medium |

---

## Traceability summary

| Acceptance scenario | Test case IDs |
|---------------------|---------------|
| Navigate to form (admin, Programs, + New Program, fields) | TC-001 |
| Successful create (exact name/description, modal closes, list) | TC-002 |
| Empty **Program Name** disables **Create** | TC-005 |

Additional cases (TC-003, TC-004, TC-006–TC-017) extend validation, auth, boundaries, duplicates, and failure modes beyond the written ACs.

---

## Ambiguities and gaps in the ACs

1. **Description required?** AC only mandates validation for empty **Program Name**; optional vs required **Description** is unspecified (TC-003).  
2. **"Modal closes" vs success** AC ties closing to success; it does not say what happens on server error — risk of false confidence if UI closes optimistically (TC-008).  
3. **Whitespace-only name** AC does not say whether spaces count as "empty" for disabling **Create** (TC-006).  
4. **Duplicate names** No rule for uniqueness or ID vs display name (TC-014).  
5. **Max length** No limits for **Program Name** or **Description** (TC-011, TC-012).  
6. **List behavior** "Shows" does not specify sort order, pagination, search, or partial match — where the new row appears after create (TC-002).  
7. **Accessibility / keyboard** No AC for focus trap, Enter to submit, or **Esc** to close — affects regressions for admin workflows.  
8. **Permissions** "Admin" is stated for navigation; other roles and direct API access are not defined (TC-009).  
9. **Field labels vs API** Assumes visible labels **Program Name** and **Description** match stored attributes; i18n or renamed labels not covered.  
10. **Post-create edit/delete** Out of scope for "create" but affects how testers confirm the correct row (e.g. duplicate names).

If you want this aligned to your actual app (exact modal title, URL, max lengths), point me at the repo screen or spec and I can map TC-011/TC-012 to concrete **N** values and UI controls.
