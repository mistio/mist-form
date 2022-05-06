/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Unit Tests', () => {
  // ignore chrome ResizeObserver error
  Cypress.on('uncaught:exception', e => {
    if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  });
  it('Opens playgroung', () => {
    cy.visit('http://localhost:8000/demo/index.html');
  });

  it('Bar with all the forms should be visible', () => {
    const vaadinItemsText = [
      'simple',
      'subform',
      'nested',
      'arrays',
      'numbers',
      'widgets',
      'references',
      'errors',
      'examples',
      'large',
      'Date & Time',
      'files',
      // 'Any Of',
      // 'One Of',
      'All Of',
      'If Then Else',
      'default',
    ];
    cy.get('vaadin-tabs > vaadin-tab').each((item, index) => {
      expect(item).to.contain.text(vaadinItemsText[index]);
    });
  });
});
