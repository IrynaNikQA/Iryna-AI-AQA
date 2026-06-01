Feature: DS-1 Create new academic program
  As an admin user
  I want to create a new academic program
  So that I can begin designing its curriculum structure

  # Happy paths

  Scenario: Open program creation form from Programs page
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields "Program Name" and "Description"

  Scenario: Successfully create Web Development 2026 program
    Given I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Create program with empty Description when Description is optional
    Given I am on the program creation form
    When I fill in "Program Name" with "Data Science Fundamentals"
    And I leave "Description" empty
    And I click "Create"
    Then the program list shows "Data Science Fundamentals"

  # Negative

  Scenario: Validation prevents submit when Program Name is empty
    Given I am on the program creation form
    When I leave the "Program Name" field empty
    Then the "Create" button is disabled

  Scenario: Validation prevents submit when Program Name is whitespace only
    Given I am on the program creation form
    When I fill in "Program Name" with "   "
    And I fill in "Description" with "Whitespace should not pass"
    Then the "Create" button is disabled
    And no new program is created

  Scenario: Dismissing the form does not create a program
    Given I am on the program creation form
    When I fill in "Program Name" with "Cloud Architecture 2040"
    And I fill in "Description" with "Draft only"
    And I close the form without clicking "Create"
    Then the program list does not show "Cloud Architecture 2040"

  Scenario: Failed create request does not appear as success
    Given I am on the program creation form
    And create API request will fail
    When I fill in "Program Name" with "Optimistic Fail Program"
    And I fill in "Description" with "Server error path"
    And I click "Create"
    Then I see an error message
    And the program list does not show "Optimistic Fail Program"

  Scenario: Non-admin user cannot create a new program
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then "+ New Program" is not available
    And no program can be created from UI

  # Edge cases

  Scenario: Program Name at minimum boundary single character
    Given I am on the program creation form
    When I fill in "Program Name" with "A"
    And I fill in "Description" with "Min name"
    And I click "Create"
    Then creation follows product min-length rule consistently

  Scenario: Program Name at maximum boundary length 255
    Given I am on the program creation form
    When I fill in "Program Name" with "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    And I fill in "Description" with "Boundary name 255"
    And I click "Create"
    Then creation follows product max-length rule consistently

  Scenario: Program Name over maximum boundary length 256
    Given I am on the program creation form
    When I fill in "Program Name" with "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    And I fill in "Description" with "Over max"
    Then the "Create" button is disabled
    And no new program is created

  Scenario: Duplicate Program Name handling
    Given a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Duplicate attempt"
    And I click "Create"
    Then duplicate handling follows business rule consistently

  Scenario: Unicode and special characters are stored safely
    Given I am on the program creation form
    When I fill in "Program Name" with "Inżynieria & Robotyka — 日本語"
    And I fill in "Description" with "Symbols: < > \" ' & © ™"
    And I click "Create"
    Then the saved values preserve characters correctly
    And no script execution occurs

  Scenario: Description with script-like payload is rendered as safe text
    Given I am on the program creation form
    When I fill in "Program Name" with "Security XSS Program"
    And I fill in "Description" with "<img src=x onerror=alert(1)>"
    And I click "Create"
    Then no JavaScript is executed
    And the value is safely escaped or sanitized

  Scenario: Double-clicking Create does not create duplicates
    Given I am on the program creation form
    When I fill in "Program Name" with "Double Click Test"
    And I fill in "Description" with "Once"
    And I double-click "Create"
    Then only one "Double Click Test" program exists in the list

  # Ambiguities / gaps in ACs
  # 1) Description required vs optional is not specified.
  # 2) Whitespace-only Program Name behavior is not explicitly defined.
  # 3) Error behavior on failed create (modal close vs stay open) is not specified.
  # 4) Duplicate Program Name rule is not defined.
  # 5) Min/max length constraints for Program Name and Description are missing.
  # 6) Non-admin authorization behavior is not defined.
  # 7) New row ordering or placement in Programs list after create is not specified.
  # 8) Keyboard and accessibility behavior (Enter submit, Esc close, focus handling) is not specified.
