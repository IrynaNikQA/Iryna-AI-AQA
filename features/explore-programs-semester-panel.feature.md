## Coverage snapshot
- Page: `/programs`
- Already covered: create (DS-1), edit (DS-2), name validation (DS-3), delete (DS-4), list display (DS-5), edit a11y
- Explored via a11y tree: this session

## Selected gap (one flow)
**Flow:** Program selection opens the semester management panel
**Why this one:** Exercises a distinct right-hand UI region that no existing spec asserts; other CRUD specs assume the list but never verify semester panel context.

## Gherkin test plan

Feature: Programs — semester panel selection (discovered)

  # Positive path
  Scenario: Selecting a program reveals the semester panel
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Semester Panel Program" exists in the list
    When I click the program name "Semester Panel Program"
    Then I do not see "Select a program to manage semesters"
    And I see "Semesters & scheduling config"
    And I see the button "+ Semester"

  # Edge case
  Scenario: Switching selection updates the semester panel
    Given I am logged in as admin
    And programs "Alpha" and "Beta" exist in the list
    And I have selected program "Alpha"
    When I click the program name "Beta"
    Then the semester panel shows "Beta"
    And the semester panel does not show "Alpha"

## Locator hints (from a11y tree)
- Empty state: paragraph "Select a program to manage semesters"
- Panel title: heading level 4 with selected program name
- Panel label: paragraph "Semesters & scheduling config"
- Add semester: button "+ Semester"
- Program row name: paragraph in table cell (click via `getByText(name, { exact: true })`)

## For test-writer
- Suggested file: `tests/ds6-program-semester-panel.spec.ts`
- POM updates: `ProgramsPage` — `selectProgram`, semester panel locators
