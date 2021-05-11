describe('Cost constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('Cost constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#cost_constraint_container paper-toggle-button')
      .should('not.have.attr', 'active');
    cy.get('mist-form')
      .find('#cost_constraint_container paper-toggle-button')
      .should('contain', 'Cost constraints');
    cy.get('mist-form')
      .find('#cost_constraint_container > paper-input')
      .should('not.exist');
  });
  it('Clicking on cost toggle shows cost subform', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_team_run_rate')
      .should('be.visible');
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_total_run_rate')
      .should('be.visible');
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Typing invalid fields in cost constraints should disable submit button', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_team_run_rate')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_total_run_rate')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_team_run_rate')
      .find('input')
      .clear({ force: true })
      .type('100', { force: true });
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_total_run_rate')
      .find('input')
      .clear({ force: true })
      .type('100', { force: true });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Clicking submit button should give object', () => {
    cy.get('mist-form').find('.submit-btn').click();
    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          cost: {
            max_team_run_rate: 100,
            max_total_run_rate: 100,
          },
        })
      );
    });
  });
});
