/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Tests', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playground', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Check simple form default entries', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[0]).should('have.attr', 'selected');
    });

    cy.get('#playground')
      .find('#salutation')
      .find('vaadin-radio-group')
      .should('have.attr', 'value')
      .and('match', /Dr/);

    cy.get('#playground').find('#salutation').find('input[value="Mr"]').click();

    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Chuck');

    cy.get('#playground')
      .find('#lastName')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Norris');

    cy.get('#playground').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Clicking on Mr should change form data', () => {
    cy.get('#playground').find('#salutation').find('input[value="Mr"]').click();

    cy.get('#playground')
      .find('#salutation')
      .find('vaadin-radio-group')
      .should('have.attr', 'value')
      .and('match', /Mr/);
  });

  it('Deleting and typing names should change form data', () => {
    // delete text on firstName
    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .click()
      .click()
      .type('{selectAll}{backspace}');

    cy.wait(500);
    // delete text on lastName
    cy.get('#playground')
      .find('#lastName')
      .find('vaadin-text-field')
      .click()
      .click()
      .click()
      .type('{selectAll}{backspace}');

    cy.wait(500);
    // check first name invalid
    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');

    // check last name invalid
    cy.get('#playground')
      .find('#lastName')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');

    // type Eis for first name and check it is there
    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .click()
      .click()
      .type('Eis');

    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Eis');

    // type D. Zaster for last name an check it is there
    cy.get('#playground')
      .find('#lastName')
      .find('vaadin-text-field')
      .click()
      .click()
      .type('D. Zaster');

    cy.get('#playground')
      .find('#lastName')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'D. Zaster');
  });

  it('Correct phone should be accepted, incorrect should have submit button disabled', () => {
    cy.get('#playground')
      .find('#telephone')
      .find('vaadin-text-field')
      .type('123456789');

    cy.get('#playground').find('.submit-btn').should('have.attr', 'disabled');

    cy.get('#playground')
      .find('#telephone')
      .find('vaadin-text-field')
      .click()
      .type('1');

    cy.get('#playground')
      .find('.submit-btn')
      .should('not.have.attr', 'disabled');
  });
});
