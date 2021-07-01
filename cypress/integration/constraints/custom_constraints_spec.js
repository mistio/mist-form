describe('Custom field constraints', () => {
    it('Opens constraints form', () => {
      cy.visit('http://localhost:8000/demo/constraints/constraints.html');
    });

    it('Custom field constraints subform should be hidden', () => {
      cy.get('mist-form')
        .find('#custom_constraint_container')
        .should('not.have.class', 'open');
      cy.get('mist-form')
        .find('#custom_constraint_container paper-toggle-button')
        .should('not.have.attr', 'active');
      cy.get('mist-form')
        .find('#custom_constraint_container paper-toggle-button')
        .should('contain', 'custom constraints');
      cy.get('mist-form')
        .find('#custom_constraint_container > paper-input')
        .should('not.exist');
    });
    it('Clicking on custom toggle shows custom subform', () => {
      cy.get('mist-form')
        .find('#custom_constraint_container paper-toggle-button')
        .click();
      cy.get('mist-form')
        .find('#custom_constraint_container')
        .should('have.class', 'open');
      cy.get('mist-form')
        .find('#custom_constraint_container > #paper_slider1')
        .should('be.visible');
      cy.get('mist-form')
        .find('#custom_constraint_container > #paper_slider2')
        .should('be.visible');
        cy.get('mist-form')
        .find('#custom_constraint_container > #color_swatch')
        .should('be.visible');
    cy.get('mist-form')
        .find('#custom_constraint_container > #color_swatch')
        .should('be.visible');
      cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    });

    it('Enter values in custom components', () => {
      cy.get('mist-form')
        .find('#custom_constraint_container > #paper_slider1')
        .find('input')
        .clear({ force: true })
        .type('20', { force: true });
    cy.get('mist-form')
        .find('#custom_constraint_container > #paper_slider2')
        .find('input')
        .clear({ force: true })
        .type('50', { force: true });
      cy.get('mist-form')
        .find('#custom_constraint_container > #color_swatch')
        .click();
    cy.get('mist-form')
        .find('#custom_constraint_container > #color_swatch').find('paper-item').first().click();
    });

    it('Clicking submit button should give object', () => {
      cy.get('mist-form').find('.submit-btn').click();
      cy.get('mist-form').then($el => {
        const el = $el[0]; // get the DOM element from the jquery element
        expect(JSON.stringify(el.value)).to.equal(
          JSON.stringify({
            custom: {
              paperSlider1: 20,
              paperSlider2: 50,
            },
          })
        );
      });
    });
  });