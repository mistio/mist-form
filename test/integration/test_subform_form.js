/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Test Subform', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playground', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Select subform', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[1]).click().should('have.attr', 'selected');
    });
  });

  it('First field should not be disabled, after pressing clear btn', () => {
    cy.get('#playground')
      .find('#title')
      .find('vaadin-text-field')
      .eq(0)
      .click()
      .click()
      .type('{selectAll}{backspace}');

    cy.get('#playground')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');
  });

  it('Second field should be disabled', () => {
    cy.get('#playground')
      .find('#task')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .click()
      .click()
      .type('{selectAll}{backspace}');

    cy.get('#playground')
      .find('#task')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');
  });

  it('Submit should be disabled', () => {
    cy.get('#playground').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Add text to first title', () => {
    cy.get('#playground')
      .find('#title')
      .find('vaadin-text-field')
      .eq(0)
      .type('Random List');
  });

  it('Add text to second field', () => {
    cy.get('#playground')
      .find('#task')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .type('Pass test');
  });

  it('Add text to details field', () => {
    cy.get('#playground')
      .find('#task')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .type('Nested form test should pass');
  });

  it('Check done', () => {
    cy.get('#playground')
      .find('#task')
      .find('mist-form')
      .find('#done')
      .find('input')
      .click();
  });

  it('Submit should be disabled', () => {
    cy.get('#playground')
      .find('.submit-btn')
      .should('not.have.attr', 'disabled');
  });
});
