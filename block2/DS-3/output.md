# Test plan: Program name validation and duplicate prevention

**Feature:** Validate program names on create (and implicitly on edit if shared rules), prevent duplicates, treat whitespace-only names as empty after trim  
**Primary UI:** Program creation form; field **Program Name** (or **Name** if relabeled—use product label); **Create**; other required fields (e.g. **Description** if required)

---

## Positive flows

### TC-001 — Program name with ampersand, hyphen, and accents is accepted

| Attribute | Details |
|-----------|---------|
| **Title** | **Program Name** `Informatique & IA - Niveau 2` creates successfully when other required fields are valid |
| **Preconditions** | User on program creation form. No existing program with that exact name (duplicate rules: TC-006). |
| **Steps** | 1. Set **Program Name** to `Informatique & IA - Niveau 2`.<br>2. Fill every other **required** field per product rules (e.g. **Description** `Cycle supérieur — mathématiques et algorithmes`).<br>3. Click **Create**. |
| **Expected result** | Program is created; success feedback per UX; list includes **Informatique & IA - Niveau 2** with stored name matching input (encoding and accents preserved). |
| **Priority** | High |
| **AC coverage** | Accept program name with special characters |

---

### TC-002 — Leading and trailing spaces trimmed; valid inner name accepted

| Attribute | Details |
|-----------|---------|
| **Title** | Name with outer spaces normalizes to trimmed value and creates if unique |
| **Preconditions** | Creation form open. Name `Cloud Native   ` not yet stored (or use unique variant). |
| **Steps** | 1. Set **Program Name** to `  Cloud Native  ` (leading/trailing spaces).<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Persisted/display name is `Cloud Native` (trimmed); no rejection solely due to benign outer whitespace. |
| **Priority** | Medium |
| **AC coverage** | Positive complement to trim/empty rules |

---

### TC-003 — Unicode letters in program name accepted

| Attribute | Details |
|-----------|---------|
| **Title** | Non-ASCII **Program Name** such as `日本語プログラム 2026` saves when unique and fields valid |
| **Preconditions** | Creation form open; required fields known. |
| **Steps** | 1. Set **Program Name** to `日本語プログラム 2026`.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Program created; list shows exact Unicode string. |
| **Priority** | Medium |
| **AC coverage** | Extends “special characters” / i18n |

---

## Negative flows

### TC-004 — Whitespace-only **Program Name** does not submit

| Attribute | Details |
|-----------|---------|
| **Title** | **Program Name** consisting only of spaces is trimmed to empty and blocks submit |
| **Preconditions** | User on program creation form. **Create** may be enabled or disabled before click per implementation. |
| **Steps** | 1. Set **Program Name** to exactly three spaces: `   `.<br>2. Fill other required fields with valid values.<br>3. Click **Create** (if enabled). |
| **Expected result** | Form is **not** submitted: no new program row; user sees validation consistent with empty name (disabled **Create** and/or inline error). Trimmed value is empty, treated like missing **Program Name**. |
| **Priority** | High |
| **AC coverage** | Reject program name with only whitespace |

---

### TC-005 — Empty **Program Name** does not submit

| Attribute | Details |
|-----------|---------|
| **Title** | Truly empty **Program Name** cannot create a program |
| **Preconditions** | Creation form open. |
| **Steps** | 1. Leave **Program Name** empty.<br>2. Fill other required fields.<br>3. Attempt **Create**. |
| **Expected result** | **Create** disabled **or** validation on submit; no program created. |
| **Priority** | High |
| **AC coverage** | Negative baseline aligned with whitespace AC |

---

### TC-006 — Duplicate **Web Development 2026** shows clear error

| Attribute | Details |
|-----------|---------|
| **Title** | Second program with **Program Name** `Web Development 2026` is rejected with an “already exists” class message |
| **Preconditions** | A program named **Web Development 2026** already exists in the system (seed or prior create). User on creation form. |
| **Steps** | 1. Set **Program Name** to `Web Development 2026`.<br>2. Fill other required fields uniquely if needed.<br>3. Click **Create**. |
| **Expected result** | User sees an error indicating the name already exists (exact copy acceptable; localized string acceptable). No duplicate row with same display name unless product explicitly allows (then AC gap). Form stays open or reopens with data preserved per UX. |
| **Priority** | High |
| **AC coverage** | Reject duplicate program name |

---

### TC-007 — Duplicate check after trim (same logical name)

| Attribute | Details |
|-----------|---------|
| **Title** | Leading/trailing spaces do not bypass duplicate detection for the same canonical name |
| **Preconditions** | Program `Web Development 2026` exists. |
| **Steps** | 1. Set **Program Name** to `  Web Development 2026  `.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Duplicate error (canonical compare after trim), same as TC-006; no new program. |
| **Priority** | High |
| **AC coverage** | Negative extension of duplicate + trim |

---

### TC-008 — Case sensitivity of duplicate match

| Attribute | Details |
|-----------|---------|
| **Title** | Product defines whether `web development 2026` duplicates `Web Development 2026` |
| **Preconditions** | Program **Web Development 2026** exists. |
| **Steps** | 1. Set **Program Name** to `web development 2026`.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Either rejected as duplicate (case-insensitive uniqueness) **or** allowed as distinct (case-sensitive)—must match documented rule; tester records actual behavior. |
| **Priority** | Medium |
| **AC coverage** | Gap closure |

---

### TC-009 — Server returns duplicate while UI thought unique

| Attribute | Details |
|-----------|---------|
| **Title** | Race between two creates with same name yields one success and one controlled error |
| **Preconditions** | Two sessions or parallel API calls; or simulate 409 from API after optimistic UI. |
| **Steps** | 1. Both attempt to create **Program Name** `Race Condition Program` simultaneously.<br>2. Observe responses and list. |
| **Expected result** | At most one persisted program; second gets duplicate/conflict error, not silent failure or orphaned partial state. |
| **Priority** | Medium |
| **AC coverage** | Negative (concurrency) |

---

### TC-010 — Unauthorized user cannot create or bypass validation

| Attribute | Details |
|-----------|---------|
| **Title** | Non-privileged user cannot create programs or duplicate errors only apply to permitted creates |
| **Preconditions** | Role without create permission (if applicable). |
| **Steps** | 1. Attempt program creation with valid unique name and with duplicate name via UI/API. |
| **Expected result** | Forbidden or hidden flow; no new programs. |
| **Priority** | High |
| **AC coverage** | Negative (authorization) |

---

## Edge cases

### TC-011 — Tab-only and mixed invisible characters

| Attribute | Details |
|-----------|---------|
| **Title** | Name with only tabs/newlines is treated as empty after trim |
| **Preconditions** | Creation form; field accepts tab/newline if paste allows. |
| **Steps** | 1. Set **Program Name** to tab-only or `\n\n` via paste.<br>2. Fill required fields.<br>3. Submit if possible. |
| **Expected result** | Same class of rejection as TC-004; not submitted. |
| **Priority** | Medium |
| **AC coverage** | Whitespace edge |

---

### TC-012 — Single visible character after trim

| Attribute | Details |
|-----------|---------|
| **Title** | **Program Name** `A` is accepted if policy allows minimum length 1 |
| **Preconditions** | Form open; name unique. |
| **Steps** | 1. Set **Program Name** to `A`.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Created **or** minimum-length validation—consistent with global name rules. |
| **Priority** | Low |

---

### TC-013 — **Program Name** at maximum length (boundary)

| Attribute | Details |
|-----------|---------|
| **Title** | Name of exactly **N** allowed characters passes validation when unique |
| **Preconditions** | Documented max **N** from UI/API. |
| **Steps** | 1. Enter exactly **N** characters (e.g. repeated `x` or realistic text).<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Success or UI-enforced cap before submit; list shows correct stored value. |
| **Priority** | Medium |

---

### TC-014 — **Program Name** one character over maximum

| Attribute | Details |
|-----------|---------|
| **Title** | **N+1** characters cannot be submitted as a valid new program |
| **Preconditions** | Max **N** known. |
| **Steps** | 1. Enter **N+1** characters in **Program Name**.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Client and/or server validation; no program created with truncated name unless user explicitly confirms truncation (unlikely). |
| **Priority** | Medium |

---

### TC-015 — SQL injection / pathological strings in name

| Attribute | Details |
|-----------|---------|
| **Title** | Name containing quotes and SQL-like fragments is stored safely or rejected with validation, never executed |
| **Preconditions** | Form open. |
| **Steps** | 1. Set **Program Name** to `O'Brien'; DROP TABLE programs;--`.<br>2. Fill required fields.<br>3. Click **Create**. |
| **Expected result** | Literal string stored **or** character policy rejects; no DB corruption; list/detail shows escaped/safe representation. |
| **Priority** | Medium |

---

### TC-016 — HTML/script-like characters in name

| Attribute | Details |
|-----------|---------|
| **Title** | Angle brackets in **Program Name** do not execute in UI when rendered |
| **Preconditions** | Form open. |
| **Steps** | 1. Set **Program Name** to `Course <Advanced> & "Quotes"`.<br>2. Fill required fields.<br>3. Create and open list. |
| **Expected result** | Display is safe; name matches stored literal when re-opened. |
| **Priority** | Medium |

---

### TC-017 — Duplicate against soft-deleted or archived program

| Attribute | Details |
|-----------|---------|
| **Title** | Uniqueness respects archived/deleted semantics |
| **Preconditions** | Program **Web Development 2026** exists as archived/soft-deleted if product supports it. |
| **Steps** | 1. Attempt new create with **Program Name** `Web Development 2026`. |
| **Expected result** | Documented: either still duplicate (name reserved) **or** allowed because prior row inactive—list and error text match that rule. |
| **Priority** | Low |

---

### TC-018 — Edit flow: renaming into duplicate

| Attribute | Details |
|-----------|---------|
| **Title** | Changing an existing program’s name to an existing name is blocked with same class of error as create |
| **Preconditions** | Programs **Web Development 2026** and **Cloud Engineering 2026** exist; user can edit **Cloud Engineering 2026**. |
| **Steps** | 1. Open edit for **Cloud Engineering 2026**.<br>2. Set name to `Web Development 2026`.<br>3. Save. |
| **Expected result** | Duplicate error; original name unchanged unless partial-save bug. |
| **Priority** | Medium |
| **AC coverage** | Edge (scope beyond “creation form” if validation is shared) |

---

### TC-019 — Double-click **Create** on valid unique name

| Attribute | Details |
|-----------|---------|
| **Title** | Only one program row created from one intended submit |
| **Preconditions** | Unique **Program Name** `Idempotent Create Test`. |
| **Steps** | 1. Fill form validly.<br>2. Double-click **Create** quickly. |
| **Expected result** | Single program; no duplicate rows from double submit. |
| **Priority** | Medium |

---

## Traceability summary

| Acceptance scenario | Test case IDs |
|---------------------|---------------|
| Whitespace-only `   `; Create; not submitted; trim → empty | TC-004 |
| `Informatique & IA - Niveau 2`; other required fields; Create; success | TC-001 |
| **Web Development 2026** exists; new same name; error already exists | TC-006 |

Supporting: TC-002, TC-003, TC-005, TC-007–TC-019.

---

## Ambiguities and gaps in the ACs

1. **“Click Create” vs disabled button** Whitespace AC implies submit attempt; if **Create** is disabled for empty/trimmed-empty name, “click Create” may be impossible—clarify whether validation is pre-click or on submit.  
2. **Field label** AC implies “program name”; DS-1 used **Program Name**—confirm label and API field name.  
3. **“Other required fields”** Not enumerated; testers need the authoritative required-field list for TC-001.  
4. **Duplicate definition** Case sensitivity, trim rules, and Unicode normalization (e.g. composed vs decomposed accents) are unspecified (TC-007, TC-008).  
5. **Edit and create** AC only mentions creation form; edit/rename may share validation (TC-018) but is out of strict AC scope.  
6. **Error UX** “Error indicating the name already exists” does not specify inline vs toast vs modal, or HTTP code mapping for API tests.  
7. **Cross-environment uniqueness** Global vs per-tenant/org duplicate scope not stated.  
8. **Max length** Not in AC; required for boundary tests (TC-013, TC-014).  
9. **Soft delete / archive** Uniqueness with inactive rows not covered (TC-017).  
10. **Concurrent creates** Not in AC; important for data integrity (TC-009).
