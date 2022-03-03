/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Tests', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });
  it('Opens playgroung', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Bar with all the forms should be visible', () => {
    const vaadinItemsText = [
      'simple',
      'subform',
      'nested',
      'arrays',
      'numbers',
      'widgets',
      'ordering',
      'references',
      'custom',
      'errors',
      'examples',
      'large',
      'Date & Time',
      'validation',
      'files',
      'single',
      'Custom Array',
      'Custom Object',
      'alternatives',
      'Property dependencies',
      'Schema dependencies',
      'Additional Properties',
      'Any Of',
      'One Of',
      'All Of',
      'If Then Else',
      'Null Fields',
      'nullable',
      'Error Schema',
      'default',
    ];
    cy.get('vaadin-tabs > vaadin-tab').each((item, index) => {
      expect(item).to.contain.text(vaadinItemsText[index]);
    });
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

    cy.get('#playground').find('.cancel-btn').click();

    cy.get('#playground').find('.cancel-btn').should('have.attr', 'focused');
  });
  it('Clicking on Mr should change form data', () => {
    cy.get('#playground').find('#salutation').find('input[value="Mr"]').click();

    cy.get('#playground')
      .find('#salutation')
      .find('vaadin-radio-group')
      .should('have.attr', 'value')
      .and('match', /Mr/);
  });

  it('Typing names should change form data', () => {
    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .find('#clearButton')
      .click();

    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');

    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .find('input')
      .click()
      .type('Eis');

    cy.get('#playground')
      .find('#firstName')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Eis');

    // cy.get('#playground').find('#lastName')
    // .find('vaadin-text-field')
    // .find('input')
    // .type('D. Zaster');

    // cy.get('#playground').find('#firstName')
    // .find('vaadin-text-field')
    // .find('input')
    // .should('have.attr', 'value', 'Eis');

    // cy.get('#playground').find('#lastName')
    // .find('vaadin-text-field')
    // .find('input')
    // .should('have.attr', 'value', 'D. Zaster');
  });
});
