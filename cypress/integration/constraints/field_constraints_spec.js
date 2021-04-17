describe('field constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('field constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .should('not.have.attr', 'active');
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .should('contain', 'Field constraints');
    cy.get('mist-form')
      .find('#field_constraint_container > paper-input')
      .should('not.exist');
  });

  it('Clicking on field toggle shows field subform', () => {
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .should('be.visible');
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Submit is disabled when adding new field and not giving a name', () => {
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-icon-button')
      .click({ force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Add two fields, give values and delete one', () => {
    // Reset field subform
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-icon-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('input')
      .last()
      .clear({ force: true })
      .type('Field1', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-icon-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('input')
      .last()
      .clear({ force: true })
      .type('Field2', { force: true });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-icon-button.remove')
      .first()
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('input')
      .last()
      .invoke('val')
      .should('contain', 'Field2');
  });

  it('Add another field and click submit button to get object', () => {
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-icon-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('input')
      .last()
      .clear({ force: true })
      .type('Field3', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container field-element')
      .find('paper-checkbox')
      .last()
      .click({ force: true });
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          field: [
            {
              name: 'Field2',
            },
            {
              show: true,
              name: 'Field3',
            },
          ],
        })
      );
    });
  });
});
