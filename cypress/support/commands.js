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
  const input = cy
    .get(locator, {
      includeShadowDom: true,
    })
    .find('textarea');
  input.type(text, { force: true, delay: 150 });
  input.then(el => {
    cy.window().then(win => {
      el[0].dispatchEvent(new win.Event('input', { composed: true }));
    });
  });
});
