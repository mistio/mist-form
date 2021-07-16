describe('Field constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('Field constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');

    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get(' paper-toggle-button').should('not.have.attr', 'active');
        cy.get(' paper-toggle-button').should('contain', 'Size constraints');
        cy.get('paper-input').should('not.exist');
      });
  });

  it('Clicking on field toggle shows field subform', () => {
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container > multi-row')
      .should('be.visible');
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
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
      .find('#field_constraint_container multi-row')
      .find('paper-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .first()
      .clear({ force: true })
      .type('Field1', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .eq(1)
      .clear({ force: true })
      .type('Value1', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .eq(2)
      .clear({ force: true })
      .type('Field2', { force: true });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-icon-button.remove')
      .first()
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .first()
      .invoke('val')
      .should('contain', 'Field2');
  });

  it('Selecting Cloud1 should hide field name', () => {
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(0)
      .click();

    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(0)
      .find('paper-item')
      .eq(1)
      .click({ force: true });

    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('.field-name')
      .should('not.exist');

    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(0)
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(0)
      .find('paper-item')
      .eq(3)
      .click({ force: true });

    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('.field-name')
      .should('be.visible');
  });

  it('Add another field and click submit button to get object', () => {
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-button.add')
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(1)
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('paper-dropdown-menu')
      .eq(1)
      .find('paper-item')
      .eq(3)
      .click({ force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .eq(2)
      .clear({ force: true })
      .type('Field3', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
      .find('input')
      .eq(3)
      .clear({ force: true })
      .type('Value3', { force: true });
    cy.get('mist-form')
      .find('#field_constraint_container multi-row')
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
              cloud: 'cloudId3',
              name: 'Field2',
            },
            {
              cloud: 'cloudId3',
              name: 'Field3',
              value: 'Value3',
              show: true,
            },
          ],
        })
      );
    });
  });
});
