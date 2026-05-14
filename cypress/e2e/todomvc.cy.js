/// <reference types="cypress" />

/**
 * Automated coverage for `test plan.md` (TC-001–TC-017).
 * Application: https://demo.playwright.dev/todomvc/#/
 */

const FOUR_ITEMS = ['Buy oat milk', 'Schedule dentist', 'Pay electricity bill', 'Book flight to Lisbon'];

function addFourItems() {
  cy.newTodoInput().as('input');
  FOUR_ITEMS.forEach((text) => {
    cy.get('@input').clear().type(`${text}{enter}`);
  });
}

beforeEach(() => {
  cy.visitTodoMvcFresh();
});

describe('Positive flows (test plan TC-001–TC-006)', () => {
  it('TC-001: empty list shows todos heading and new-todo entry', () => {
    cy.contains('h1', 'todos').should('be.visible');
    cy.get('input.new-todo')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'What needs to be done?');
    cy.get('body').find('.todo-list li').should('have.length', 0);
  });

  it('TC-002: four distinct todos appear in order with correct counter', () => {
    addFourItems();
    cy.get('.todo-list li').should('have.length', 4);
    FOUR_ITEMS.forEach((label) => {
      cy.todoRow(label).should('have.length', 1);
    });
    cy.contains('.todo-count', '4 items left').should('be.visible');
  });

  it('TC-003: completing one item shows completed state and 3 items left', () => {
    addFourItems();
    cy.todoRow('Pay electricity bill').find('.toggle').click();
    cy.todoRow('Pay electricity bill').first().should('have.class', 'completed');
    cy.contains('.todo-count', '3 items left').should('be.visible');
  });

  it('TC-004: destroy removes only the targeted row and updates count', () => {
    addFourItems();
    cy.todoRow('Schedule dentist').find('.destroy').click({ force: true });
    cy.get('.todo-list li').should('have.length', 3);
    cy.todoRow('Schedule dentist').should('have.length', 0);
    ['Buy oat milk', 'Pay electricity bill', 'Book flight to Lisbon'].forEach((label) => {
      cy.todoRow(label).should('have.length', 1);
    });
    cy.contains('.todo-count', '3 items left').should('be.visible');
  });

  it('TC-005: Mark all as complete finishes every active todo', () => {
    addFourItems();
    cy.get('#toggle-all').click();
    FOUR_ITEMS.forEach((label) => {
      cy.todoRow(label).first().should('have.class', 'completed');
    });
    cy.contains('.todo-count', '0 items left').should('be.visible');
    cy.contains('button', 'Clear completed').should('be.visible');
  });

  it('TC-006: Active filter shows only incomplete todos', () => {
    addFourItems();
    cy.todoRow('Buy oat milk').find('.toggle').click();
    cy.todoRow('Book flight to Lisbon').find('.toggle').click();
    cy.contains('a', 'Active').click();
    cy.get('.todo-list li').should('have.length', 2);
    cy.todoRow('Schedule dentist').first().should('be.visible');
    cy.todoRow('Pay electricity bill').first().should('be.visible');
  });
});

describe('Negative flows (test plan TC-007–TC-011)', () => {
  it('TC-007: whitespace-only submit does not create a row', () => {
    cy.newTodoInput().type('   {enter}');
    cy.get('body').find('.todo-list li').should('have.length', 0);
  });

  it('TC-008: Enter on empty new-todo does not duplicate existing item', () => {
    cy.newTodoInput().type('Buy oat milk{enter}');
    cy.newTodoInput().type('{enter}{enter}');
    cy.get('.todo-list li').should('have.length', 1);
    cy.todoRow('Buy oat milk').should('have.length', 1);
  });

  it('TC-009: destroy removes only the clicked row among four', () => {
    addFourItems();
    cy.todoRow('Pay electricity bill').find('.destroy').click({ force: true });
    cy.todoRow('Pay electricity bill').should('have.length', 0);
    ['Buy oat milk', 'Schedule dentist', 'Book flight to Lisbon'].forEach((label) => {
      cy.todoRow(label).should('have.length', 1);
    });
  });

  it('TC-010: completing a todo keeps it visible on All', () => {
    cy.newTodoInput().type('Buy oat milk{enter}');
    cy.todoRow('Buy oat milk').find('.toggle').click();
    cy.todoRow('Buy oat milk').first().should('have.class', 'completed');
    cy.contains('a', 'All').click();
    cy.todoRow('Buy oat milk').first().should('be.visible');
  });

  it('TC-011: deleted todo does not return after reload', () => {
    cy.newTodoInput().type('Temp task A{enter}');
    cy.todoRow('Temp task A').find('.destroy').click({ force: true });
    cy.todoRow('Temp task A').should('have.length', 0);
    cy.reload();
    cy.todoRow('Temp task A').should('have.length', 0);
  });
});

describe('Edge cases (test plan TC-012–TC-017)', () => {
  it('TC-012: very long single-line todo is accepted', () => {
    const unit = 'EdgeCase-';
    const long = unit.repeat(Math.ceil(500 / unit.length)).slice(0, 500);
    cy.newTodoInput().type(`${long}{enter}`);
    cy.todoRow(long).first().should('be.visible');
    cy.todoRow(long).first().find('.destroy').should('exist');
  });

  it('TC-013: duplicate titles create separate rows; toggles are independent', () => {
    cy.newTodoInput().type('Same title{enter}');
    cy.newTodoInput().type('Same title{enter}');
    cy.get('.todo-list li').filter((_, el) => {
      const lbl = el.querySelector('label');
      return (lbl?.textContent ?? '').trim() === 'Same title';
    }).should('have.length', 2);
    cy.contains('.todo-count', '2 items left').should('be.visible');

    cy.get('.todo-list li')
      .filter((_, el) => (el.querySelector('label')?.textContent ?? '').trim() === 'Same title')
      .first()
      .find('.toggle')
      .click();
    cy.get('.todo-list li')
      .filter((_, el) => (el.querySelector('label')?.textContent ?? '').trim() === 'Same title')
      .first()
      .should('have.class', 'completed');
    cy.get('.todo-list li')
      .filter((_, el) => (el.querySelector('label')?.textContent ?? '').trim() === 'Same title')
      .eq(1)
      .should('not.have.class', 'completed');
  });

  it('TC-014: HTML-like text is shown as plain text', () => {
    const raw = `<script>alert(1)</script> & "quotes" 'apostrophe' € 中文`;
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });
    cy.newTodoInput().type(`${raw}{enter}`);
    cy.todoRow(raw).first().should('contain.text', '<script>');
    cy.get('@alertStub').should('not.have.been.called');
  });

  it('TC-015: leading and trailing spaces are trimmed on create', () => {
    cy.newTodoInput().type('  Trim me  {enter}');
    cy.todoRow('Trim me').should('have.length', 1);
    cy.get('.todo-list li').should('have.length', 1);
  });

  it('TC-016: very large input does not crash the page', () => {
    const huge = 'x'.repeat(10_000);
    cy.newTodoInput().type(`${huge}{enter}`, { delay: 0 });
    cy.get('.todo-list li').should('have.length', 1);
    cy.contains('h1', 'todos').should('be.visible');
  });

  it('TC-017: four short items preserve order and count', () => {
    ['A', 'B', 'C', 'D'].forEach((c) => {
      cy.newTodoInput().clear().type(`${c}{enter}`);
    });
    cy.get('.todo-list li label').then(($labels) => {
      const texts = [...$labels].map((el) => el.innerText.trim());
      expect(texts).to.deep.equal(['A', 'B', 'C', 'D']);
    });
    cy.contains('.todo-count', '4 items left').should('be.visible');
  });
});
