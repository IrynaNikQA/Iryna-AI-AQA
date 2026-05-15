# Test plan (structured): DS-2 — Edit existing program details

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — *Edit existing program details*  
**Jira source:** `summary` and `description` via Atlassian MCP (`getJiraIssue`, site **legionqaschool**).

> This file is the **structured** test plan. The legacy table-format artifact remains **`output.md`** in this folder.

**Story (from Jira):** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

**AC note:** Jira uses **Name** for the rename step; the UI may label the field **Program Name** — use the label that maps to the same field in the app under test.

**Programs / values from ACs:** **Web Development 2026**; updated name **Web Development 2026 - Updated**; **edit icon** on the program row; **Save**.

---

## Positive flows

### TC-001

- **ID:** TC-001  
- **Title:** Edit form shows current **Name** / **Program Name** and **Description** for **Web Development 2026**.  
- **Preconditions:** User is logged in as **admin**; **Programs** lists **Web Development 2026** with known **Description** (e.g. `Full-stack web development program`).  
- **Steps:**  
  1. Open **Programs**.  
  2. Locate row **Web Development 2026**.  
  3. Click the **edit icon** on that row.  
- **Expected result:** Edit form visible; **Name** / **Program Name** is `Web Development 2026`; **Description** matches stored text; **Save** available.  
- **Priority:** High  
- **AC coverage:** Open program for editing  

---

### TC-002

- **ID:** TC-002  
- **Title:** After **Save**, the list shows **Web Development 2026 - Updated** and the edit UI closes.  
- **Preconditions:** Edit form is open for **Web Development 2026**.  
- **Steps:**  
  1. Change **Name** / **Program Name** to `Web Development 2026 - Updated`.  
  2. Click **Save**.  
- **Expected result:** Modal/panel closes; list **immediately** shows **Web Development 2026 - Updated** (no stale **Web Development 2026** title without refresh, per AC).  
- **Priority:** High  
- **AC coverage:** Successfully edit a program name  

---

### TC-003

- **ID:** TC-003  
- **Title:** After changing only **Description**, **Name** / **Program Name** remains **Machine Learning 2027**.  
- **Preconditions:** Program **Machine Learning 2027** exists with **Description** `Original syllabus`; user is **admin** on its edit form.  
- **Steps:**  
  1. Confirm **Name** / **Program Name** is `Machine Learning 2027`.  
  2. Set **Description** to `Revised syllabus — cohort Q2 2026`.  
  3. Click **Save**.  
- **Expected result:** List still shows **Machine Learning 2027**; description updated per product surfaces.  
- **Priority:** High  
- **AC coverage:** Edit preserves unchanged fields  

---

### TC-004

- **ID:** TC-004  
- **Title:** **Save** with no edits leaves **Stable Program 88** and **Stable description 88** unchanged.  
- **Preconditions:** **Stable Program 88** exists with **Description** `Stable description 88`; edit form open.  
- **Steps:**  
  1. Do not change **Name** / **Program Name** or **Description**.  
  2. Click **Save**.  
- **Expected result:** Edit UI closes; list still reflects **Stable Program 88** and same description content.  
- **Priority:** Medium  
- **AC coverage:** *(Beyond AC — no-op save)*  

---

### TC-005

- **ID:** TC-005  
- **Title:** Single **Save** persists both **Name** `Alpha Program - Revised` and **Description** `Revised scope and outcomes`.  
- **Preconditions:** Program **Alpha Program** exists with **Description** `Original`; edit form open.  
- **Steps:**  
  1. Set **Name** / **Program Name** to `Alpha Program - Revised`.  
  2. Set **Description** to `Revised scope and outcomes`.  
  3. Click **Save**.  
- **Expected result:** List shows **Alpha Program - Revised**; description matches `Revised scope and outcomes` where shown or after reload.  
- **Priority:** Medium  
- **AC coverage:** *(Beyond AC — both fields)*  

---

## Negative flows

### TC-006

- **ID:** TC-006  
- **Title:** Clearing **Name** / **Program Name** does not persist for **Named Program Alpha**.  
- **Preconditions:** **Named Program Alpha** exists; edit form open.  
- **Steps:**  
  1. Clear **Name** / **Program Name**.  
  2. Set **Description** to `Still here after empty name attempt`.  
  3. Attempt **Save** or observe **Save** first.  
- **Expected result:** **Save** disabled or validation blocks; **Named Program Alpha** unchanged on list.  
- **Priority:** High  
- **AC coverage:** *(Not in AC — edit empty name)*  

---

### TC-007

- **ID:** TC-007  
- **Title:** Canceling edit does not persist **Should Not Persist 42** as the name for **Web Development 2026**.  
- **Preconditions:** **Web Development 2026** exists; edit form open.  
- **Steps:**  
  1. Change **Name** / **Program Name** to `Should Not Persist 42`.  
  2. Change **Description** to `Discard me`.  
  3. Click **Cancel**, **X**, or **Esc** (whichever exists).  
- **Expected result:** Edit closes; list still shows **Web Development 2026**.  
- **Priority:** Medium  
- **AC coverage:** *(Discard path — not in AC)*  

---

### TC-008

- **ID:** TC-008  
- **Title:** Failed update API does not show **Ghost Edit Name** without confirmed success.  
- **Preconditions:** User can force update API to fail; edit open for **Beta Program**.  
- **Steps:**  
  1. Change **Name** / **Program Name** to `Ghost Edit Name`.  
  2. Click **Save** while the update fails.  
- **Expected result:** Error shown; list does not show **Ghost Edit Name** unless server confirmed.  
- **Priority:** High  
- **AC coverage:** *(Negative vs optimistic close — not in AC)*  

---

### TC-009

- **ID:** TC-009  
- **Title:** Non-admin does not persist **Unauthorized Edit 001** via edit UI.  
- **Preconditions:** Non-admin account.  
- **Steps:**  
  1. Log in as non-admin.  
  2. Open **Programs**.  
  3. If **edit** is visible, attempt rename to **Unauthorized Edit 001** and **Save**.  
- **Expected result:** **Edit** unavailable or forbidden; no persisted rename.  
- **Priority:** High  
- **AC coverage:** *(Authorization — AC assumes admin context)*  

---

## Edge cases

### TC-010

- **ID:** TC-010  
- **Title:** **Name** / **Program Name** `あ` with **Description** `Min name` on edit follows min-length rules.  
- **Preconditions:** **Unicode Edit Base** exists; edit form open.  
- **Steps:**  
  1. Set **Name** / **Program Name** to `あ`.  
  2. Set **Description** to `Min name`.  
  3. Click **Save** if enabled.  
- **Expected result:** Saved per policy or validation explains minimum length.  
- **Priority:** Low  
- **AC coverage:** *(Boundary)*  

---

### TC-011

- **ID:** TC-011  
- **Title:** **Name** / **Program Name** of exactly **N** characters (e.g. **N** repetitions of `x`) with **Description** `Boundary edit N` saves or is constrained.  
- **Preconditions:** **N** from spec/UI.  
- **Steps:**  
  1. Paste **N** × `x` into **Name** / **Program Name**.  
  2. Set **Description** to `Boundary edit N`.  
  3. Click **Save**.  
- **Expected result:** Success at **N** or enforced cap with feedback.  
- **Priority:** Medium  
- **AC coverage:** *(Max length — not in AC)*  

---

### TC-012

- **ID:** TC-012  
- **Title:** Renaming **Gamma Program** to **Web Development 2026** when that name exists follows duplicate rules.  
- **Preconditions:** **Web Development 2026** and **Gamma Program** both exist.  
- **Steps:**  
  1. Open edit for **Gamma Program**.  
  2. Set **Name** / **Program Name** to `Web Development 2026`.  
  3. Set **Description** to `Collision test`.  
  4. Click **Save**.  
- **Expected result:** Duplicate error or allowed duplicates per product — not ambiguous.  
- **Priority:** Medium  
- **AC coverage:** *(Duplicates — not in AC)*  

---

### TC-013

- **ID:** TC-013  
- **Title:** **Name** `Inżynieria & Robotyka — 日本語` and **Description** `Symbols: < > " ' & © ™` persist without XSS or encoding loss.  
- **Preconditions:** **Unicode Edit Base** exists; edit form open.  
- **Steps:**  
  1. Set **Name** / **Program Name** to `Inżynieria & Robotyka — 日本語`.  
  2. Set **Description** to `Symbols: < > " ' & © ™`.  
  3. Click **Save**.  
- **Expected result:** Values match input after reload; no script execution.  
- **Priority:** Medium  
- **AC coverage:** *(Special characters — not in AC)*  

---

### TC-014

- **ID:** TC-014  
- **Title:** Multiline **Description** `Line1` / `Line2` / `Line3` for **Multiline Edit Program** is stored consistently.  
- **Preconditions:** **Multiline Edit Program** exists; edit form open.  
- **Steps:**  
  1. Set **Description** to three lines: `Line1`, newline, `Line2`, newline, `Line3`.  
  2. Click **Save**.  
- **Expected result:** Breaks preserved or normalized per documented rules.  
- **Priority:** Low  
- **AC coverage:** *(Multiline — not in AC)*  

---

### TC-015

- **ID:** TC-015  
- **Title:** Double-click **Save** when renaming to **Double Save Edit** applies only one persisted update.  
- **Preconditions:** Edit open for **Delta Program** with **Description** `Once`.  
- **Steps:**  
  1. Set **Name** / **Program Name** to `Double Save Edit`.  
  2. Double-click **Save** quickly.  
- **Expected result:** One update; loading/disabled during request.  
- **Priority:** Medium  
- **AC coverage:** *(Double-submit — not in AC)*  

---

### TC-016

- **ID:** TC-016  
- **Title:** **Description** `<img src=x onerror=alert(1)>` on **Security XSS Edit Base** does not execute when rendered.  
- **Preconditions:** **Security XSS Edit Base** exists; edit form open.  
- **Steps:**  
  1. Set **Description** to `<img src=x onerror=alert(1)>`.  
  2. Click **Save**.  
  3. Open list/detail where **Description** renders.  
- **Expected result:** No alert; literal text if shown.  
- **Priority:** Medium  
- **AC coverage:** *(Security — not in AC)*  

---

## AC → test traceability

| Jira Gherkin scenario | Test case IDs |
|----------------------|---------------|
| **Programs**; **Web Development 2026** exists; **edit icon** → form pre-populated | TC-001 |
| Rename to **Web Development 2026 - Updated**; **Save**; close; list **immediately** shows new name | TC-002 |
| Only **Description** changed; **Save**; **Name** unchanged | TC-003 |

---

## Ambiguities and gaps in the ACs

1. **Name vs Program Name** — AC uses **Name**; UI may differ (TC-001, TC-002).  
2. **“Immediately”** — no latency/cache definition (TC-002).  
3. **Save failure** — not specified (TC-008).  
4. **Empty / whitespace name on edit** — not specified (TC-006).  
5. **Max length** — not specified (TC-011).  
6. **Duplicate names on rename** — not specified (TC-012).  
7. **Concurrent editors** — not specified.  
8. **Non-admin** — not specified (TC-009).  
9. **Keyboard / a11y** — not specified (TC-007).  
10. **“Other fields remain unchanged”** — which fields besides **Name** and **Description** are in scope is not listed in Jira.
