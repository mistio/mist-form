describe('Constraints form', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
    cy.get('mist-form').find('.mist-header').contains('Constraints');
  });

  it('Add button is disabled, Cancel button is enabled', () => {
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form').find('.cancel-btn').should('not.have.attr', 'disabled');
  });
});
