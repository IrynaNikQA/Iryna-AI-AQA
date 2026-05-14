# Test plan: Delete program with confirmation

**Feature:** Delete a program from the **Programs** list using a **delete icon**, with a **confirmation dialog** before removal  
**Primary surfaces:** Programs list, **delete icon** per row, confirmation UI (modal/dialog), actions **Confirm** / **Delete** (primary confirm label as implemented) and **Cancel**

---

## Positive flows

### TC-001 — Confirming delete removes **Test Program** from the list

| Attribute | Details |
|-----------|---------|
| **Title** | After confirmation, **Test Program** no longer appears on the program list |
| **Preconditions** | A program named **Test Program** exists and is visible on the **Programs** page. User has permission to delete programs. |
| **Steps** | 1. Open the **Programs** page.<br>2. Locate the row for **Test Program**.<br>3. Click the **delete icon** for **Test Program**.<br>4. Verify a **confirmation dialog** appears (title/body may name the program).<br>5. Click the control that confirms deletion (e.g. **Delete**, **Confirm**, **Yes**—per product copy). |
| **Expected result** | Dialog closes. **Test Program** is removed from the program list (row gone or list refreshed without that name). No error toast unless success message is product standard. |
| **Priority** | High |
| **AC coverage** | Delete program with confirmation |

---

### TC-002 — Cancel leaves the program in the list

| Attribute | Details |
|-----------|---------|
| **Title** | Dismissing delete via **Cancel** keeps the program row unchanged |
| **Preconditions** | At least one program exists, e.g. **Web Development 2026** (or **Test Program** if recreated after TC-001). User on **Programs** page. |
| **Steps** | 1. Click the **delete icon** for the chosen program.<br>2. When the **confirmation dialog** appears, click **Cancel** (or equivalent **No**, **Close** if that is the cancel path per UX spec).<br>3. Observe the program list. |
| **Expected result** | Dialog closes. The program still exists in the list with the same **Name** (and same row identity if inspectable). No delete API success for that action. |
| **Priority** | High |
| **AC coverage** | Cancel program deletion |

---

### TC-003 — Confirmation copy references the program being deleted

| Attribute | Details |
|-----------|---------|
| **Title** | Confirmation dialog clearly indicates which program will be deleted |
| **Preconditions** | Two programs exist: **Test Program** and **Cloud Engineering 2026**. |
| **Steps** | 1. Click **delete icon** for **Test Program** only.<br>2. Read confirmation dialog text. |
| **Expected result** | Dialog text includes **Test Program** (or unambiguous identifier); **Cloud Engineering 2026** is not implied as the delete target. |
| **Priority** | Medium |
| **AC coverage** | Positive UX extension of confirmation AC |

---

## Negative flows

### TC-004 — User without delete permission cannot remove programs

| Attribute | Details |
|-----------|---------|
| **Title** | Restricted role cannot complete delete via UI or API |
| **Preconditions** | User logged in without delete entitlement but may view **Programs** (if applicable). **Test Program** exists. |
| **Steps** | 1. Open **Programs**.<br>2. Attempt to find **delete icon** and use it; if hidden, attempt direct delete API with same user token. |
| **Expected result** | **Delete icon** absent/disabled **or** confirmation never leads to success; server returns forbidden; **Test Program** remains. |
| **Priority** | High |
| **AC coverage** | Negative (authorization) |

---

### TC-005 — Delete API failure does not remove row without error

| Attribute | Details |
|-----------|---------|
| **Title** | Failed delete request keeps program listed and surfaces an error |
| **Preconditions** | **Test Program** exists. Ability to mock/block delete endpoint or force 5xx/timeout. |
| **Steps** | 1. Open delete confirmation for **Test Program**.<br>2. Confirm while delete API fails.<br>3. Refresh list or wait for refresh. |
| **Expected result** | User sees error message; **Test Program** still present; no optimistic removal that is not rolled back. |
| **Priority** | High |
| **AC coverage** | Negative (integrity vs optimistic UI) |

---

### TC-006 — Rapid double-click on confirm does not cause inconsistent state

| Attribute | Details |
|-----------|---------|
| **Title** | Double confirm triggers at most one successful delete and no duplicate errors that confuse the user |
| **Preconditions** | **Test Program** exists. |
| **Steps** | 1. Open confirmation for **Test Program**.<br>2. Double-click confirm rapidly. |
| **Expected result** | Program removed once; no second program affected; no unhandled 404 spam if already deleted—graceful handling. |
| **Priority** | Medium |
| **AC coverage** | Negative (idempotency) |

---

### TC-007 — Deleting while another user edits the same program

| Attribute | Details |
|-----------|---------|
| **Title** | Concurrent edit vs delete ends in defined, non-corrupt state |
| **Preconditions** | Two sessions; **Test Program** exists; user B has edit open while user A deletes. |
| **Steps** | 1. User A confirms delete of **Test Program**.<br>2. User B attempts save on edit form for **Test Program**. |
| **Expected result** | B receives not-found/conflict message; no orphan UI state suggesting program still exists globally. |
| **Priority** | Medium |
| **AC coverage** | Negative (concurrency) |

---

## Edge cases

### TC-008 — Program name with special characters: **Informatique & IA - Niveau 2**

| Attribute | Details |
|-----------|---------|
| **Title** | Confirmation and delete work when program **Name** contains `&`, hyphens, accents |
| **Preconditions** | Program **Informatique & IA - Niveau 2** exists. |
| **Steps** | 1. Click **delete icon** for that row.<br>2. Confirm dialog shows correct name encoding.<br>3. Confirm deletion. |
| **Expected result** | Program removed from list; dialog and list render name correctly (no HTML entity glitches). |
| **Priority** | Medium |
| **AC coverage** | Special characters (edge) |

---

### TC-009 — Very long program name in confirmation

| Attribute | Details |
|-----------|---------|
| **Title** | Dialog layout handles max-length **Name** without hiding **Cancel** / **Confirm** |
| **Preconditions** | Program whose **Name** is at or near maximum allowed length (e.g. 255 characters), unique text. |
| **Steps** | 1. Trigger delete confirmation.<br>2. Scroll dialog if needed; attempt **Cancel** and re-open, then **Confirm** in separate runs or use two seeded rows. |
| **Expected result** | All actions reachable; on confirm, program removed; no clipped critical buttons. |
| **Priority** | Low |
| **AC coverage** | Max-length / boundary |

---

### TC-010 — Keyboard: **Esc** or focus trap on confirmation

| Attribute | Details |
|-----------|---------|
| **Title** | Keyboard dismissal matches **Cancel** behavior when product specifies it |
| **Preconditions** | Delete confirmation open. |
| **Steps** | 1. Press **Esc** (if supported).<br>2. Re-open delete flow; use **Tab** to focus **Cancel** and activate with **Enter**/**Space**. |
| **Expected result** | **Esc** cancels without delete (if in spec); focus order includes **Cancel** and confirm; program remains when cancel path used. |
| **Priority** | Low |
| **AC coverage** | Accessibility edge |

---

### TC-011 — Click outside dialog / backdrop (if modal)

| Attribute | Details |
|-----------|---------|
| **Title** | Backdrop click does not delete program unless explicitly designed as confirm |
| **Preconditions** | Modal confirmation with backdrop. |
| **Steps** | 1. Open delete confirmation for **Test Program**.<br>2. Click outside dialog on backdrop. |
| **Expected result** | Either same as **Cancel** (program remains) **or** nothing happens—never equivalent to confirm delete without documented high-risk UX. |
| **Priority** | Medium |
| **AC coverage** | Edge (modal pattern) |

---

### TC-012 — Delete last program in list

| Attribute | Details |
|-----------|---------|
| **Title** | UI shows sensible empty state after deleting the only program |
| **Preconditions** | Only **Test Program** exists (or temporarily isolate env). |
| **Steps** | 1. Delete **Test Program** with confirmation.<br>2. Observe page. |
| **Expected result** | List empty or empty-state message; no broken layout or stale “ghost” row. |
| **Priority** | Medium |
| **AC coverage** | Edge (empty list) |

---

### TC-013 — Unicode program name **日本語プログラム 2026**

| Attribute | Details |
|-----------|---------|
| **Title** | Delete confirmation and removal work for non-Latin **Name** |
| **Preconditions** | Program **日本語プログラム 2026** exists. |
| **Steps** | 1. Open delete confirmation.<br>2. Confirm deletion. |
| **Expected result** | Program removed; encoding correct in dialog and list before removal. |
| **Priority** | Medium |
| **AC coverage** | Special characters / i18n |

---

### TC-014 — Pagination or virtualized list after delete

| Attribute | Details |
|-----------|---------|
| **Title** | Removing a row updates current page and counts correctly |
| **Preconditions** | Enough programs to span pages or long scroll (e.g. 25+). **Test Program** on page 2 or mid-list. |
| **Steps** | 1. Delete **Test Program** from its page.<br>2. Navigate pages / scroll. |
| **Expected result** | **Test Program** absent; page size/total count consistent; no duplicate pagination glitch. |
| **Priority** | Low |
| **AC coverage** | Edge (list mechanics) |

---

### TC-015 — Two programs named **Test Program** (if duplicates allowed)

| Attribute | Details |
|-----------|---------|
| **Title** | Delete icon targets exactly one row; confirmation matches selected row id |
| **Preconditions** | If product allows duplicate display names, two rows **Test Program** exist with distinct IDs. |
| **Steps** | 1. Delete via icon on first row; confirm.<br>2. Verify which row disappeared. |
| **Expected result** | Only targeted row removed; second **Test Program** remains **or** duplicates disallowed—document actual product rule. |
| **Priority** | Low |
| **AC coverage** | Duplicate-name edge |

---

## Traceability summary

| Acceptance scenario | Test case IDs |
|---------------------|---------------|
| **Test Program** exists; delete icon; confirmation; confirm; removed from list | TC-001 |
| Delete icon; confirmation; **Cancel**; program still in list | TC-002 |

---

## Ambiguities and gaps in the ACs

1. **Confirm control label** AC says “confirm deletion” but not the exact button text (**Delete** vs **Confirm** vs **Yes**)—affects automation selectors.  
2. **Dialog type** Native `window.confirm`, custom modal, or drawer—not specified; impacts TC-011 and keyboard behavior.  
3. **Soft delete vs hard delete** AC says “removed from list” but not whether program is purged or archived/invisible—API and audit implications.  
4. **Dependencies** No AC for programs with courses/enrollments; delete may be blocked or cascade—undefined.  
5. **Undo / toast** No requirement for undo link or success notification.  
6. **Which program for cancel AC** “A program” is generic; TC-002 uses a concrete name for clarity—AC does not require a specific name.  
7. **Permissions** Not stated; TC-004 assumes role-based delete.  
8. **Concurrent users** Not covered; TC-007 documents gap.  
9. **Failure handling** Not in AC; TC-005 required for production quality.  
10. **Boundary / special-character names** Not in AC; included as regression risks (TC-008, TC-009, TC-013).
