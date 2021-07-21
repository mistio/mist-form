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
        cy.get(' paper-toggle-button').should('contain', 'Field constraints');
        cy.get('paper-input').should('not.exist');
      });
  });

  it('Clicking on field toggle shows field subform', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get('paper-toggle-button').click();
        cy.get('mist-form-multi-row#field').should('be.visible');
      });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Add two fields, give values and delete one', () => {
    // Reset field subform
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .find('mist-form-multi-row')
      .within(() => {
        cy.get('paper-button.add').click({ force: true });

        cy.get('mist-form-row')
          .first()
          .within(() => {
            cy.get('#name')
              .find('input')
              .clear({ force: true })
              .type('Field1', { force: true });
            cy.get('#value')
              .find('input')
              .clear({ force: true })
              .type('Value1', { force: true });
          });

        cy.get('paper-button.add').click({ force: true });

        cy.get('mist-form-row')
          .eq(1)
          .within(() => {
            cy.get('#name')
              .find('input')
              .clear({ force: true })
              .type('Field2', { force: true });
          });
      });

    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');

    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .find('mist-form-multi-row')
      .within(() => {
        cy.get('paper-icon-button.remove').first().click({ force: true });
        cy.get('#name').find('input').invoke('val').should('contain', 'Field2');
      });
  });

  it('Selecting Cloud1 should hide field name', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .find('mist-form-multi-row')
      .find('mist-form-row')
      .first()
      .within(() => {
        cy.get('paper-dropdown-menu').click();
        cy.get('paper-dropdown-menu').find('paper-item').eq(1).click();
        cy.get('.field-name').should('not.be.visible');

        cy.get('paper-dropdown-menu').eq(0).click();
        cy.get('paper-dropdown-menu')
          .eq(0)
          .find('paper-item')
          .eq(3)
          .click({ force: true });

        cy.get('.field-name').should('be.visible');
      });
  });

  it('Add another field and click submit button to get object', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .find('mist-form-multi-row')
      .within(() => {
        cy.get('paper-button.add').click({ force: true });

        cy.get('mist-form-row')
          .first()
          .within(() => {
            cy.get('paper-dropdown-menu').click();
            cy.get('paper-dropdown-menu')
              .find('paper-item')
              .eq(3)
              .click({ force: true });
          });

        cy.get('mist-form-row')
          .eq(1)
          .within(() => {
            cy.get('paper-dropdown-menu').click();
            cy.get('paper-dropdown-menu')
              .find('paper-item')
              .eq(2)
              .click({ force: true });
            cy.get('#name')
              .find('input')
              .clear({ force: true })
              .type('Field3', { force: true });
            cy.get('#value')
              .find('input')
              .clear({ force: true })
              .type('Value3', { force: true });
            cy.get('paper-checkbox').last().click({ force: true });
          });
      });
    cy.wait(500);
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          field: [
            { name: 'Field2', cloud: 'cloudId3' },
            { cloud: 'cloudId2', name: 'Field3', show: true, value: 'Value3' },
          ],
        })
      );
    });
  });
});
