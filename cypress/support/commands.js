/** @see test plan.md — React TodoMVC demo */
Cypress.Commands.add('visitTodoMvcFresh', () => {
  cy.visit('/todomvc/#/');
  cy.window().then((win) => {
    win.localStorage.clear();
  });
  cy.reload();
});

Cypress.Commands.add('newTodoInput', () =>
  cy.get('input.new-todo').should('be.visible'),
);

/**
 * Rows matching an exact label (0..n). Uses synchronous DOM read so empty lists
 * (no `.todo-list li` in DOM) do not make `cy.find` retry until timeout.
 */
Cypress.Commands.add('todoRow', (label) =>
  cy.get('body').then(($body) => {
    const $match = $body.find('.todo-list li').filter((_, el) => {
      const lbl = el.querySelector('label');
      return (lbl?.textContent ?? '').trim() === label;
    });
    return cy.wrap($match);
  }),
);
