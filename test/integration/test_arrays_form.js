/* eslint-disable no-undef */
/* eslint-disable consistent-return */

// Arrays List of Fixed Items is buggy.

describe('Unit Test Arrays', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playground', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Select subform', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[3]).click().should('have.attr', 'selected');
    });
  });
});
