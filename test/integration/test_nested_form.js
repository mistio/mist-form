/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Test Nested', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });

  it('Opens playground', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Select subform', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[2]).click().should('have.attr', 'selected');
    });
  });

  it('Delete default tasks', () => {
    cy.wait(1000);
    // delete 2nd default tasks
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('vaadin-button')
      .eq(2)
      .click();
    cy.wait(1000);
    // delete 1st default task
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('vaadin-button')
      .eq(2)
      .click();
    cy.wait(1000);
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .should('not.exist');
  });

  it('Submit button should be enabled with no items in the list, no items should be present', () => {
    cy.get('#playground')
      .find('.submit-btn')
      .should('not.have.attr', 'disabled');
  });

  it('Add new task', () => {
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .should('not.exist');

    cy.get('#playground').find('#tasks').find('vaadin-button').click();
  });

  it('Submit button should be disabled with empty item', () => {
    cy.get('#playground').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Add 2nd task', () => {
    cy.wait(1000);
    cy.get('#playground').find('#tasks').find('vaadin-button').eq(3).click();
  });

  it('Fill the first task', () => {
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .type('Task no 1');
    cy.wait(500);
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .type('Details of Task no 1');
    cy.wait(500);
    // click Done
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#done')
      .find('input')
      .click();
    cy.wait(500);
  });

  it('Move 1st Task to 2nd', () => {
    // move up button should be disabled
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('vaadin-button')
      .eq(0)
      .should('have.attr', 'disabled');

    // press second button
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('vaadin-button')
      .eq(1)
      .click();

    // first text should now be empty
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'invalid');

    // fields of the second task should have previous input
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Task no 1');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .should('have.attr', 'value', 'Details of Task no 1');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#done')
      .find('vaadin-checkbox')
      .should('have.attr', 'checked');
  });

  it('Move second task back up', () => {
    // move down button should be disabled
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('vaadin-button')
      .eq(1)
      .should('have.attr', 'disabled');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('vaadin-button')
      .eq(0)
      .click();

    // check inputs are unchanged
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Task no 1');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .should('have.attr', 'value', 'Details of Task no 1');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#done')
      .find('vaadin-checkbox')
      .should('have.attr', 'checked');

    cy.get('#playground').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Fill in second Task and check delete button', () => {
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .type('Task no 2');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .type('Details of Task no 2');

    // click Done
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(1)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#done')
      .find('input')
      .click();

    // delete first
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('vaadin-button')
      .eq(2)
      .click();
  });

  it('Check values of remaining task and submit button', () => {
    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#title')
      .find('vaadin-text-field')
      .should('have.attr', 'value', 'Task no 2');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#details')
      .find('vaadin-text-area')
      .should('have.attr', 'value', 'Details of Task no 2');

    cy.get('#playground')
      .find('#tasks')
      .find('ul')
      .find('li')
      .eq(0)
      .find('mist-form-object-field')
      .find('mist-form')
      .find('#done')
      .find('vaadin-checkbox')
      .should('have.attr', 'checked');

    cy.get('#playground')
      .find('.submit-btn')
      .should('not.have.attr', 'disabled');
  });
});
