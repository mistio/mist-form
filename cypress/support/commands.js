// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('paperTextAreaType', (locator, text) => {
  console.log('locator ', locator);
  cy.get(locator, {
    includeShadowDom: true,
  })
    .find('textarea')
    .type(text, { force: true, delay: 150 });
  cy.get(locator, {
    includeShadowDom: true,
  })
    .find('textarea')
    .then(el => {
      cy.window().then(win => {
        el[0].dispatchEvent(new win.Event('input', { composed: true }));
      });
    });
});

Cypress.Commands.add('testPaperDropdownSelected', (locator, text) => {
  cy.get(locator, {
    includeShadowDom: true,
  })
    .find('paper-dropdown-menu > paper-listbox')
    // .find('paper-listbox')
    // .find('paper-item.iron-selected')
    // .should('have.attr', 'value')
    .then(el => {
      console.log('el ', el);
      expect(el[0].selected).to.equal(text);
    });
});
