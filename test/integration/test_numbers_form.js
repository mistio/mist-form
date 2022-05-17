/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Test Numbers', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playground', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Select subform', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[4]).click().should('have.attr', 'selected');
    });
  });

  it('Test Number field', () => {
    // press cancel button
    cy.get('#playground')
      .find('#number')
      .find('vaadin-number-field')
      .click()
      .click()
      .type('{selectAll}{backspace}');

    cy.get('#playground')
      .find('#number')
      .find('vaadin-number-field')
      .should('have.attr', 'value', 'NaN');

    // type in a number
    cy.get('#playground')
      .find('#number')
      .find('vaadin-number-field')
      .find('input')
      .click()
      .type('8');

    cy.get('#playground')
      .find('#number')
      .find('vaadin-number-field')
      .should('have.attr', 'value', '8');
  });

  it('Test integer field', () => {
    // check if it is empty
    cy.get('#playground')
      .find('#integer')
      .find('vaadin-integer-field')
      .find('input', { includeShadowDom: false })
      .invoke('val')
      .should(value => {
        expect(value).eq('');
      });

    // type -12
    cy.get('#playground')
      .find('#integer')
      .find('vaadin-integer-field')
      .find('input')
      .click()
      .click()
      .type('-12');

    // check that the value is correct
    cy.get('#playground')
      .find('#integer')
      .find('vaadin-integer-field')
      .find('input', { includeShadowDom: false })
      .invoke('val')
      .should(value => {
        expect(value).eq('-12');
      });
  });

  it('Test enum', () => {
    cy.get('#playground').find('#numberEnum').find('vaadin-select').click();

    // click the second
    cy.get('vaadin-select-overlay').find('vaadin-item').eq(1).click();

    cy.get('#playground')
      .find('#numberEnum')
      .find('vaadin-select')
      .find('vaadin-item')
      .should('have.attr', 'value', '2');
  });

  it('Test radio enum', () => {
    // click 3rd radio button
    cy.get('#playground')
      .find('#numberEnumRadio')
      .find('vaadin-radio-group')
      .find('vaadin-radio-button')
      .eq(2)
      .click();

    cy.get('#playground')
      .find('#numberEnumRadio')
      .find('vaadin-radio-group')
      .should('have.attr', 'value', '3');
  });
});
