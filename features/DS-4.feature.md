Feature: DS-4 Delete program with confirmation
  As an admin user
  I want to delete a program I no longer need, with a confirmation step
  So that accidental deletion is prevented

  # Happy paths

  Scenario: Confirming delete removes Test Program from the list
    Given a program named "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel leaves the program in the list
    Given a program exists on the Programs page
    When I click the delete icon for that program
    Then I see a confirmation dialog
    When I click Cancel
    Then the program still exists in the list

  Scenario: Confirmation dialog references the program being deleted
    Given programs "Test Program" and "Cloud Engineering 2026" exist
    When I click the delete icon for "Test Program"
    Then the confirmation dialog text includes "Test Program"
    And "Cloud Engineering 2026" is not implied as the delete target

  # Negative

  Scenario: User without delete permission cannot remove programs
    Given I am logged in as a non-admin user without delete entitlement
    And a program named "Test Program" exists
    When I open the Programs page
    Then the delete icon is absent or disabled
    And "Test Program" remains in the list

  Scenario: Failed delete API keeps program listed and surfaces an error
    Given a program named "Test Program" exists
    And the delete API will fail
    When I confirm deletion of "Test Program"
    Then I see an error message
    And "Test Program" still appears in the program list

  Scenario: Rapid double-click on confirm does not cause inconsistent state
    Given a program named "Test Program" exists
    When I open the delete confirmation for "Test Program"
    And I double-click the confirm control rapidly
    Then the program is removed at most once
    And no unhandled error state occurs

  Scenario: Concurrent edit vs delete ends in a defined non-corrupt state
    Given two sessions and a program named "Test Program" exists
    And user B has the edit form open for "Test Program"
    When user A confirms deletion of "Test Program"
    And user B attempts to save the edit form
    Then user B receives a not-found or conflict message
    And no orphan UI state suggests the program still exists globally

  # Edge cases

  Scenario: Delete program with special characters in name
    Given a program named "Informatique & IA - Niveau 2" exists
    When I click the delete icon for "Informatique & IA - Niveau 2"
    Then the confirmation dialog shows the name correctly
    When I confirm deletion
    Then "Informatique & IA - Niveau 2" is removed from the list

  Scenario: Very long program name in confirmation dialog
    Given a program whose Name is at or near maximum length exists
    When I open the delete confirmation for that program
    Then Cancel and Confirm controls remain reachable
    When I confirm deletion
    Then the program is removed from the list

  Scenario: Keyboard Esc dismisses confirmation like Cancel
    Given a delete confirmation dialog is open
    When I press Esc
    Then the program remains in the list

  Scenario: Clicking outside the dialog does not confirm deletion
    Given a delete confirmation dialog is open for "Test Program"
    When I click outside the dialog on the backdrop
    Then the program remains in the list

  Scenario: Deleting the last program shows a sensible empty state
    Given only "Test Program" exists on the Programs page
    When I confirm deletion of "Test Program"
    Then the list is empty or shows an empty-state message
    And no broken layout or ghost row remains

  Scenario: Delete program with Unicode name
    Given a program named "日本語プログラム 2026" exists
    When I open the delete confirmation
    And I confirm deletion
    Then "日本語プログラム 2026" is removed from the list

  Scenario: Delete updates pagination and list counts correctly
    Given enough programs exist to span multiple pages
    And "Test Program" appears on page 2 or mid-list
    When I confirm deletion of "Test Program"
    Then "Test Program" is absent from all pages
    And page size and total count remain consistent

  Scenario: Delete icon targets exactly one row when duplicate names exist
    Given two programs named "Test Program" exist with distinct IDs
    When I delete via the delete icon on the first row and confirm
    Then only the targeted row is removed
    And the second "Test Program" remains in the list

  # Ambiguities / gaps in ACs
  # 1) Confirm control label not specified (Delete vs Confirm vs Yes).
  # 2) Dialog type not specified (native window.confirm vs custom modal).
  # 3) Soft delete vs hard delete not defined.
  # 4) No AC for programs with courses/enrollments (blocked vs cascade).
  # 5) No requirement for undo link or success notification.
  # 6) Cancel AC uses generic "a program" without naming requirements.
  # 7) Permissions not stated in AC.
  # 8) Concurrent users not covered in AC.
  # 9) Failure handling not in AC.
  # 10) Boundary and special-character names not in AC.
