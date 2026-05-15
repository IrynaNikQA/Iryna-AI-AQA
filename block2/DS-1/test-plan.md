# Test plan (structured): DS-1 — Create new academic program

**Jira:** [DS-1](https://legionqaschool.atlassian.net/browse/DS-1) — *Create new academic program*  
**Jira source:** `summary` and `description` via Atlassian MCP (`getJiraIssue`, site **legionqaschool**).

> This file is the **structured** test plan. The legacy table-format artifact remains **`output.md`** in this folder.

**Story (from Jira):** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.  
**Confluence (from Jira):** *Program Setup & Management > Overview*

**UI strings from ACs:** **Programs** page; **+ New Program**; fields **Program Name**, **Description**; **Create**.

---

## Positive flows

### TC-001

- **ID:** TC-001  
- **Title:** Program creation form is visible with **Program Name** and **Description** after opening from Programs.  
- **Preconditions:** User is logged in as **admin**.  
- **Steps:**  
  1. Open the **Programs** page.  
  2. Click **+ New Program**.  
- **Expected result:** A program creation form appears containing **Program Name** and **Description**, and a way to submit (e.g. **Create**).  
- **Priority:** High  
- **AC coverage:** Navigate to program creation form  

---

### TC-002

- **ID:** TC-002  
- **Title:** Program list shows **Web Development 2026** after successful create using Jira’s example values.  
- **Preconditions:** User is logged in as **admin**; creation form is open.  
- **Steps:**  
  1. Enter **Program Name** `Web Development 2026`.  
  2. Enter **Description** `Full-stack web development program`.  
  3. Click **Create**.  
- **Expected result:** Creation UI closes; **Programs** lists **Web Development 2026**; description content is visible or reachable per product rules.  
- **Priority:** High  
- **AC coverage:** Successfully create a program  

---

### TC-003

- **ID:** TC-003  
- **Title:** Program **Data Science Fundamentals** is created when **Description** is empty, if the product treats **Description** as optional.  
- **Preconditions:** User is logged in as **admin**; creation form is open.  
- **Steps:**  
  1. Enter **Program Name** `Data Science Fundamentals`.  
  2. Leave **Description** empty.  
  3. If **Create** is enabled, click **Create**.  
- **Expected result:** If optional: UI closes and list shows **Data Science Fundamentals**. If required: validation blocks submit — document under *Ambiguities*.  
- **Priority:** Medium  
- **AC coverage:** *(Beyond AC — optional Description)*  

---

## Negative flows

### TC-004

- **ID:** TC-004  
- **Title:** **Create** cannot submit a program while **Program Name** is empty.  
- **Preconditions:** User is logged in as **admin**; creation form is open.  
- **Steps:**  
  1. Leave **Program Name** empty.  
  2. Enter **Description** `Any supporting text`.  
  3. Observe **Create**; if it appears enabled, click once.  
- **Expected result:** **Create** is disabled or submit does not create a row.  
- **Priority:** High  
- **AC coverage:** Validation prevents empty program name  

---

### TC-005

- **ID:** TC-005  
- **Title:** Dismissing the form does not persist **Cloud Architecture 2040**.  
- **Preconditions:** User is logged in as **admin**; **+ New Program** form is open.  
- **Steps:**  
  1. Enter **Program Name** `Cloud Architecture 2040`.  
  2. Enter **Description** `Draft only`.  
  3. Close via **Cancel**, **X**, or **Esc** (whichever exists).  
  4. Confirm the **Programs** list.  
- **Expected result:** **Cloud Architecture 2040** does not appear as a saved program.  
- **Priority:** Medium  
- **AC coverage:** *(Integrity — not in AC)*  

---

### TC-006

- **ID:** TC-006  
- **Title:** Failed create API does not leave **Optimistic Fail Program** on the list without confirmed success.  
- **Preconditions:** User is logged in as **admin**; ability to force create API to fail.  
- **Steps:**  
  1. Open **+ New Program**.  
  2. Set **Program Name** `Optimistic Fail Program`.  
  3. Set **Description** `Server error path`.  
  4. Click **Create** while the request fails.  
- **Expected result:** Clear error; list does not show **Optimistic Fail Program** unless the server confirmed create.  
- **Priority:** High  
- **AC coverage:** *(Negative vs optimistic close — not in AC)*  

---

### TC-007

- **ID:** TC-007  
- **Title:** Non-admin does not persist **Security Basics 101** through the create flow.  
- **Preconditions:** Non-admin account exists.  
- **Steps:**  
  1. Log in as non-admin.  
  2. Open **Programs**.  
  3. If **+ New Program** exists, try **Program Name** `Security Basics 101`, **Description** `Should not save`, **Create**.  
- **Expected result:** **+ New Program** hidden or **Create** blocked; no new row **Security Basics 101**.  
- **Priority:** High  
- **AC coverage:** *(Authorization — AC assumes admin)*  

---

## Edge cases

### TC-008

- **ID:** TC-008  
- **Title:** Whitespace-only **Program Name** `   ` with **Description** `Robotics Lab` does not create a blank-name program.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** to three spaces `   `.  
  2. Set **Description** to `Robotics Lab`.  
  3. Observe or click **Create** per UI rules.  
- **Expected result:** **Create** disabled or validation blocks; no whitespace-only name row.  
- **Priority:** High  
- **AC coverage:** *(Edge — AC says “empty” only)*  

---

### TC-009

- **ID:** TC-009  
- **Title:** Single-character **Program Name** `あ` with **Description** `Min name` follows product min-length rules.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** to `あ`.  
  2. Set **Description** to `Min name`.  
  3. Click **Create** if enabled.  
- **Expected result:** Program saved as `あ` or validation explains minimum length.  
- **Priority:** Low  
- **AC coverage:** *(Boundary)*  

---

### TC-010

- **ID:** TC-010  
- **Title:** **Program Name** at documented maximum length **N** (e.g. 255 × `x`) with **Description** `Boundary name N` saves or is blocked consistently.  
- **Preconditions:** **N** taken from product spec or UI counter (replace 255 if different).  
- **Steps:**  
  1. Paste a string of exactly **N** copies of `x` into **Program Name**.  
  2. Set **Description** to `Boundary name N`.  
  3. Click **Create**.  
- **Expected result:** Success at **N** or hard stop at **N** with feedback.  
- **Priority:** Medium  
- **AC coverage:** *(Max length — not in AC)*  

---

### TC-011

- **ID:** TC-011  
- **Title:** **Program Name** of length **N+1** cannot be submitted without user-consented truncation.  
- **Preconditions:** **N** known.  
- **Steps:**  
  1. Enter **N+1** characters in **Program Name**.  
  2. Set **Description** to `Over max`.  
  3. Attempt **Create**.  
- **Expected result:** **Create** disabled or validation error.  
- **Priority:** Medium  
- **AC coverage:** *(Over-max — not in AC)*  

---

### TC-012

- **ID:** TC-012  
- **Title:** Second program named **Web Development 2026** with **Description** `Duplicate attempt` follows duplicate-name rules.  
- **Preconditions:** **Web Development 2026** already exists on the list.  
- **Steps:**  
  1. Open **+ New Program**.  
  2. Set **Program Name** `Web Development 2026`.  
  3. Set **Description** `Duplicate attempt`.  
  4. Click **Create**.  
- **Expected result:** Duplicate error or two rows per product policy — not ambiguous.  
- **Priority:** Medium  
- **AC coverage:** *(Duplicates — not in AC)*  

---

### TC-013

- **ID:** TC-013  
- **Title:** **Program Name** `Inżynieria & Robotyka — 日本語` and **Description** `Symbols: < > " ' & © ™` persist without encoding or XSS issues.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** to `Inżynieria & Robotyka — 日本語`.  
  2. Set **Description** to `Symbols: < > " ' & © ™`.  
  3. Click **Create**.  
- **Expected result:** Values match input after reload; no script execution.  
- **Priority:** Medium  
- **AC coverage:** *(Special characters — not in AC)*  

---

### TC-014

- **ID:** TC-014  
- **Title:** Multiline **Description** (`Line1`, `Line2`, `Line3`) for **Program Name** `Multiline Desc Program` is stored consistently.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** to `Multiline Desc Program`.  
  2. Set **Description** to three lines: `Line1`, newline, `Line2`, newline, `Line3`.  
  3. Click **Create**.  
- **Expected result:** Line breaks preserved or normalized per documented behavior.  
- **Priority:** Low  
- **AC coverage:** *(Multiline — not in AC)*  

---

### TC-015

- **ID:** TC-015  
- **Title:** Double-click **Create** for **Program Name** `Double Click Test` and **Description** `Once` does not create duplicate rows.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** `Double Click Test`.  
  2. Set **Description** `Once`.  
  3. Double-click **Create** quickly.  
- **Expected result:** At most one **Double Click Test** row; loading/disabled state during request.  
- **Priority:** Medium  
- **AC coverage:** *(Idempotency — not in AC)*  

---

### TC-016

- **ID:** TC-016  
- **Title:** **Description** `<img src=x onerror=alert(1)>` for **Program Name** `Security XSS Program` is stored and rendered safely.  
- **Preconditions:** User is logged in as **admin**; creation form open.  
- **Steps:**  
  1. Set **Program Name** `Security XSS Program`.  
  2. Set **Description** `<img src=x onerror=alert(1)>`.  
  3. Click **Create**.  
  4. Open views where **Description** renders.  
- **Expected result:** No script execution; literal text if shown.  
- **Priority:** Medium  
- **AC coverage:** *(Security — not in AC)*  

---

## AC → test traceability

| Jira Gherkin scenario | Test case IDs |
|----------------------|---------------|
| Admin → **Programs** → **+ New Program** → form with **Program Name**, **Description** | TC-001 |
| **Web Development 2026** + **Full-stack web development program** → **Create** → close → list shows name | TC-002 |
| Empty **Program Name** → **Create** disabled | TC-004 |

---

## Ambiguities and gaps in the ACs

1. **Optional vs required Description** — not stated (TC-003).  
2. **Whitespace vs empty** **Program Name** — not stated (TC-008).  
3. **API failure** vs modal close — not stated (TC-006).  
4. **Duplicate names** — not stated (TC-012).  
5. **Max length** — not stated (TC-010, TC-011).  
6. **List ordering / where new row appears** — not stated (TC-002).  
7. **Keyboard / a11y** (Enter, Esc, focus) — not stated (TC-005).  
8. **Non-admin** — AC assumes admin (TC-007).  
9. **Confluence** may add rules beyond Jira description text.  
10. **Double-submit** — not stated (TC-015).
