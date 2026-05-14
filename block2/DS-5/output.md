# Test plan: Program list filtering and display

**Feature:** **Programs** page: list display of programs (and filtering/search if implemented—see ambiguities)  
**List columns / fields in ACs:** each program’s **name** and **description**  
**Navigation:** user opens **Programs** page (route/menu as per product)

---

## Positive flows

### TC-001 — List shows **Name** and **Description** for each existing program

| Attribute | Details |
|-----------|---------|
| **Title** | Every program row displays both **Name** and **Description** on the **Programs** page |
| **Preconditions** | At least these programs exist: **Web Development 2026** with description `Full-stack web development program`, and **Informatique & IA - Niveau 2** with description `Cycle supérieur — mathématiques et algorithmes`. |
| **Steps** | 1. Log in as a user who can view programs (e.g. admin).<br>2. Navigate to the **Programs** page.<br>3. For each seeded program, locate its row or card. |
| **Expected result** | List is visible. Row for **Web Development 2026** shows that **Name** and the matching **Description** text. Row for **Informatique & IA - Niveau 2** shows that **Name** and **Description**. No program row is missing **Description** if stored non-empty (see TC-012 for empty description). |
| **Priority** | High |
| **AC coverage** | Display program list with key details |

---

### TC-002 — Empty state message and create-first prompt when no programs exist

| Attribute | Details |
|-----------|---------|
| **Title** | With zero programs, **Programs** page shows empty-state copy and a prompt to create the first program |
| **Preconditions** | Environment has **no** programs (fresh tenant, truncated test DB, or filtered view that truly has zero results—prefer globally zero for strict AC match). |
| **Steps** | 1. Navigate to the **Programs** page.<br>2. Read on-screen messaging and primary call-to-action. |
| **Expected result** | User sees a message that no programs have been created (wording may vary but meaning clear). User sees a prompt to create the first program (e.g. **+ New Program**, **Create program**, or inline link). List of program rows is absent or replaced by empty-state panel. |
| **Priority** | High |
| **AC coverage** | Empty state when no programs exist |

---

### TC-003 — Single program list still shows name and description

| Attribute | Details |
|-----------|---------|
| **Title** | One program in the system renders correctly as a one-row list |
| **Preconditions** | Exactly one program: **Test Program**, description `Smoke test description`. |
| **Steps** | 1. Open **Programs** page.<br>2. Verify the sole entry. |
| **Expected result** | One row/card shows **Test Program** and `Smoke test description`. Layout is not broken (no “table header only” glitch). |
| **Priority** | Medium |
| **AC coverage** | Display (boundary count) |

---

## Negative flows

### TC-004 — User without access must not see program names or descriptions

| Attribute | Details |
|-----------|---------|
| **Title** | Unauthorized or unauthenticated user does not get a normal program list with data |
| **Preconditions** | Programs **Web Development 2026** and **Data Science Fundamentals** exist. |
| **Steps** | 1. As user without **Programs** view permission (or logged out), open **Programs** URL directly or via navigation if visible.<br>2. Optionally call list API without valid token. |
| **Expected result** | Redirect to login, **403**, or empty/forbidden UI per product; program **Name**/**Description** not exposed in client for forbidden users. |
| **Priority** | High |
| **AC coverage** | Negative (security / permissions) |

---

### TC-005 — API or network failure does not show a false empty state as “no programs created”

| Attribute | Details |
|-----------|---------|
| **Title** | Failed load distinguishes error from true zero programs |
| **Preconditions** | Programs exist. Ability to block list API or return 500. |
| **Steps** | 1. Open **Programs** while list request fails.<br>2. Observe message. |
| **Expected result** | Error/retry state—not the same copy as TC-002 implying user has created nothing—unless product incorrectly conflates (then log defect). |
| **Priority** | High |
| **AC coverage** | Negative (correctness of empty vs error) |

---

### TC-006 — Partial payload must not render blank names for existing programs

| Attribute | Details |
|-----------|---------|
| **Title** | List does not show misleading empty **Name** for valid records |
| **Preconditions** | Backend returns valid data under normal conditions. |
| **Steps** | 1. Open **Programs** with normal response.<br>2. If mock available, simulate missing `name` on one item and reload. |
| **Expected result** | Normal: all names present. Abnormal: row shows placeholder/error, not silent empty that looks like TC-002. |
| **Priority** | Medium |
| **AC coverage** | Negative (data integrity display) |

---

## Edge cases

### TC-007 — Long **Description** truncation or expand behavior

| Attribute | Details |
|-----------|---------|
| **Title** | Very long description is readable or expandable without breaking list layout |
| **Preconditions** | Program **Cloud Engineering 2026** with description of ~800 characters (real sentences). |
| **Steps** | 1. Open **Programs**.<br>2. Observe description display; use **Show more**, tooltip, or navigate to detail if offered. |
| **Expected result** | Layout does not overflow uncontrollably; user can access full text per UX (truncate + expand, ellipsis + tooltip, or full wrap within bounds). |
| **Priority** | Medium |
| **AC coverage** | Edge (max-length display) |

---

### TC-008 — Long **Name** display

| Attribute | Details |
|-----------|---------|
| **Title** | Long program **Name** (e.g. 200 characters) displays without hiding **Description** |
| **Preconditions** | One program with long **Name** and short **Description** `Short blurb`. |
| **Steps** | 1. Open **Programs**.<br>2. Inspect row layout. |
| **Expected result** | **Name** and **Description** both visible or accessible; no overlap that makes **Description** unreadable. |
| **Priority** | Medium |
| **AC coverage** | Boundary display |

---

### TC-009 — Special characters and HTML in **Name** / **Description** render safely

| Attribute | Details |
|-----------|---------|
| **Title** | Values like `Course <Advanced> & "QA"` and `Symbols: < > " '` display as text, not as HTML |
| **Preconditions** | Program **Course <Advanced> & "QA"** with description `Symbols: < > " ' & ©`. |
| **Steps** | 1. Open **Programs**.<br>2. View list. |
| **Expected result** | Literal characters visible; no script execution; no broken markup. |
| **Priority** | Medium |
| **AC coverage** | Special characters |

---

### TC-010 — Unicode **Name** and **Description**

| Attribute | Details |
|-----------|---------|
| **Title** | **日本語プログラム 2026** and Arabic or accented text display correctly |
| **Preconditions** | Program **日本語プログラム 2026**, description `العربية وال日本ية — test`. |
| **Steps** | 1. Open **Programs**. |
| **Expected result** | Correct glyphs and direction (RTL segments) per global CSS rules; **Name** and **Description** both shown. |
| **Priority** | Medium |
| **AC coverage** | Unicode / i18n |

---

### TC-011 — Pagination or “load more” preserves visibility of name and description

| Attribute | Details |
|-----------|---------|
| **Title** | Programs beyond the first page still show **Name** and **Description** after paging |
| **Preconditions** | At least 25 programs (or more than one page per product default), including **Web Development 2026** on page 2 if sorted alphabetically—adjust seed so a known program sits on page 2. |
| **Steps** | 1. Open **Programs**.<br>2. Go to page 2 (or infinite scroll until target row). |
| **Expected result** | Each visible row still has **Name** and **Description**; known program appears with correct fields. |
| **Priority** | Medium |
| **AC coverage** | Edge (scale) |

---

### TC-012 — Empty **Description** in list

| Attribute | Details |
|-----------|---------|
| **Title** | Program with no description shows a sensible empty placeholder or blank cell, not wrong data |
| **Preconditions** | Program **Minimal Name Only** exists with empty or null **Description** if product allows. |
| **Steps** | 1. Open **Programs**.<br>2. Find **Minimal Name Only**. |
| **Expected result** | **Name** visible; **Description** column shows em dash, “—”, “No description”, or empty styled cell—consistent with design system; not another program’s description. |
| **Priority** | Medium |
| **AC coverage** | Edge (“empty input” display) |

---

### TC-013 — Duplicate display names (if allowed)

| Attribute | Details |
|-----------|---------|
| **Title** | Two rows with same **Name** still each show **Description** (or disambiguation) |
| **Preconditions** | If duplicates allowed: two programs both named **Shared Title** with different descriptions `First instance` and `Second instance`. |
| **Steps** | 1. Open **Programs**.<br>2. Compare the two rows. |
| **Expected result** | User can tell rows apart via **Description** or secondary column (ID, date); no merged cell bug. |
| **Priority** | Low |
| **AC coverage** | Duplicates display |

---

### TC-014 — Search or filter narrows list (if feature exists)

| Attribute | Details |
|-----------|---------|
| **Title** | Applying filter/search shows only matching programs but each row still has **Name** and **Description** |
| **Preconditions** | Programs **Web Development 2026**, **Web Design Basics**, **Data Science Fundamentals** exist. UI has search or filter (if not present, mark N/A and log AC vs title gap). |
| **Steps** | 1. Open **Programs**.<br>2. Enter search term `Web` or filter category that should return two programs.<br>3. Clear filter. |
| **Expected result** | Filtered rows each show **Name** and **Description**; clearing restores full list matching TC-001 behavior. |
| **Priority** | Medium |
| **AC coverage** | Conditional: filtering (task title) |

---

### TC-015 — Sort order stability

| Attribute | Details |
|-----------|---------|
| **Title** | If sort controls exist, order is deterministic and **Name**/**Description** stay aligned to correct row |
| **Preconditions** | Multiple programs. Sort by **Name** A–Z if available. |
| **Steps** | 1. Note order of **Web Development 2026** and **Data Science Fundamentals**.<br>2. Toggle sort if applicable.<br>3. Verify descriptions still match names. |
| **Expected result** | No column/row mismatch after sort. |
| **Priority** | Low |
| **AC coverage** | Edge (display consistency) |

---

## Traceability summary

| Acceptance scenario | Test case IDs |
|---------------------|---------------|
| Programs exist; **Programs** page; list shows each program’s **name** and **description** | TC-001 |
| No programs; **Programs** page; message no programs; prompt to create first | TC-002 |

---

## Ambiguities and gaps in the ACs

1. **Task vs AC mismatch** The task names **“filtering and display”**, but written ACs only cover **display** and **empty state**—no acceptance criteria for filters, search, facets, or sort (TC-014 conditional).  
2. **“Key details”** AC limits to **name** and **description**; other useful columns (status, dates, enrollment) are out of scope unless added to ACs.  
3. **Empty description** Not specified how list should render missing **Description** (TC-012).  
4. **Empty state CTA** “Prompt to create the first program” does not name the control (**+ New Program** vs other)—automation needs stable selector or accessibility name.  
5. **Permissions** Who may view the list when programs exist is not stated (TC-004).  
6. **Zero programs scope** “No programs exist” could be tenant-wide vs current filter; if filters exist, empty state copy may be wrong when filter yields zero but programs exist (TC-014 / TC-002 conflict risk).  
7. **Pagination / virtualization** Not mentioned; long lists need explicit expectations (TC-011).  
8. **Max length** No limits stated for how **Name**/**Description** appear in list cells (TC-007, TC-008).  
9. **Loading state** AC does not define skeleton/spinner vs blank flash before data loads.  
10. **Duplicates** Uniqueness of **Name** not in AC; display of duplicates not defined (TC-013).
