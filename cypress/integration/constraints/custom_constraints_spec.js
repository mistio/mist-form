describe('Custom field constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('Custom constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#custom_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');

    cy.get('mist-form')
      .find('#custom_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get(' paper-toggle-button').should('not.have.attr', 'active');
        cy.get(' paper-toggle-button').should('contain', 'Custom components');
        cy.get('paper-input').should('not.exist');
      });
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
      .find('#custom_constraint_container > #hide_paper_slider1')
      .should('be.visible');
    cy.get('mist-form')
      .find('#custom_constraint_container > #color_swatch')
      .should('be.visible');
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Typing yes or sure in in text field should hide paperSlider1', () => {
    cy.get('mist-form')
      .find('#custom_constraint_container')
      .within(() => {
        cy.get('#hide_paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('yes', { force: true });

        cy.get('#paper_slider1').should('not.exist');

        cy.get('#hide_paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('no', { force: true });

        cy.get('#paper_slider1').should('be.visible');

        cy.get('#hide_paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('sure', { force: true });
        cy.get('mist-form').find('#paper_slider1').should('not.exist');

        cy.get('#hide_paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('Test', { force: true });
        cy.get('mist-form').find('#paper_slider1').should('be.visible');
      });
  });

  it('Enter values in custom components', () => {
    cy.get('mist-form')
      .find('#custom_constraint_container')
      .within(() => {
        cy.get('#paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('20', { force: true });
        cy.get('#paper_slider2')
          .find('input')
          .clear({ force: true })
          .type('50', { force: true });
        cy.get('#color_swatch').click();
        cy.get('#color_swatch').find('paper-item').first().click();
        cy.get('#hide_paper_slider1')
          .find('input')
          .clear({ force: true })
          .type('Text', { force: true });
      });
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
            colorSwatch: '#ffebee',
            hidePaperSlider1: 'Text',
          },
        })
      );
    });
  });
});
