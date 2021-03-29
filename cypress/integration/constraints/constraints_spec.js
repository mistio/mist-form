describe('Constraints form', () => {
    it('Opens constraints form', () => {
        cy.visit('http://localhost:8000/demo/constraints/constraints.html')
        cy.get('mist-form').find('.mist-header').contains('Constraints');
      });

      it('Add button is disabled, Cancel button is enabled', () => {
        cy.get('mist-form').find('.submit-btn').should('not.be.enabled');
        cy.get('mist-form').find('.cancel-btn').should('not.be.disabled');
      });

      it('Cost constraints subform should be hidden', () => {
        cy.get('mist-form').find('#cost_constraint_container').should('not.have.class', 'open');
        cy.get('mist-form').find('#cost_constraint_container paper-toggle-button').should('not.be.enabled');
        cy.get('mist-form').find('#cost_constraint_container paper-toggle-button').should('contain', 'Cost constraints');
        cy.get('mist-form').find('#cost_constraint_container > paper-input').should('not.exist');
      });
      it('Clicking on cost toggle shows cost subform', () => {
        cy.get('mist-form').find('#cost_constraint_container paper-toggle-button').click();
        cy.get('mist-form').find('#cost_constraint_container').should('have.class', 'open');
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_team_run_rate').should('be.visible');
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_total_run_rate').should('be.visible');
        cy.get('mist-form').find('.submit-btn').should('not.be.disabled');
      });

      it('Typing invalid fields in cost constraints should disable submit button', () => {
        // Can't type into input
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_team_run_rate').find('input').clear({force: true}).type('0', {force: true});
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_total_run_rate').find('input').clear({force: true}).type('0', {force: true});
        cy.get('mist-form').find('.submit-btn').should('be.enabled');
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_team_run_rate').find('input').clear({force: true}).type('100', {force: true});
        cy.get('mist-form').find('#cost_constraint_container > #cost_max_total_run_rate').find('input').clear({force: true}).type('100', {force: true});
        cy.get('mist-form').find('.submit-btn').should('not.be.disabled');
      });
  })
