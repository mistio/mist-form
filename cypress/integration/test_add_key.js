/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Test Add Key Form', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playgroung', () => {
    cy.visit('http://localhost:8000/demo/?mist');
  });

  it('Check that all fields are invalid, submit disabled', () => {
    cy.get('#playground')
      .find('#name')
      .get('vaadin-text-field')
      .should('have.attr', 'invalid');

    cy.get('#playground')
      .find('#private')
      .get('vaadin-text-area')
      .should('have.attr', 'invalid');

    cy.get('#playground')
      .find('vaadin-horizontal-layout')
      .get('.submit-btn')
      .should('have.attr', 'disabled');
  });

  it('Add a name', () => {
    cy.get('#playground')
      .find('#name')
      .get('vaadin-text-field')
      .click()
      .click() // cypress needs double click for some reason..
      .type('A random Key');

    cy.get('#playground')
      .find('vaadin-horizontal-layout')
      .get('.submit-btn')
      .should('have.attr', 'disabled');

    cy.get('#playground')
      .find('#name')
      .get('vaadin-text-field')
      .should('have.attr', 'value', 'A random Key');
  });

  it('Click generate, submit should be enabled', () => {
    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(1)
      .should('have.attr', 'value', 'generate');

    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(1)
      .click();

    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(1)
      .should('have.attr', 'checked');

    cy.get('#playground')
      .find('vaadin-horizontal-layout')
      .get('.submit-btn')
      .should('not.have.attr', 'disabled');
  });

  it('Click upload, private key field should be invalid, submit btn should be disabled', () => {
    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(0)
      .should('have.attr', 'value', 'upload');

    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(0)
      .click();

    cy.get('#playground')
      .find('#action')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(0)
      .should('have.attr', 'checked');

    cy.get('#playground')
      .find('vaadin-horizontal-layout')
      .get('.submit-btn')
      .should('not.have.attr', 'disabled');

    cy.get('#playground')
      .find('#private')
      .get('vaadin-text-area')
      .should('have.attr', 'invalid');
  });

  it('Type in the private key, submit button should become enabled', () => {
    cy.get('#playground')
      .find('#private')
      .get('vaadin-text-area')
      .click()
      .click()
      .type('Private Key Begin');

    cy.get('#playground')
      .find('vaadin-horizontal-layout')
      .get('.submit-btn')
      .should('not.have.attr', 'disabled');

    cy.get('#playground')
      .find('#private')
      .get('vaadin-text-area')
      .should('have.attr', 'value', 'Private Key Begin');
  });
});
