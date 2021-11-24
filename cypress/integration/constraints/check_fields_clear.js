describe('Field clearing test', () => {
  it('Open form', () => {
    cy.visit(
      'http://localhost:8000/demo/constraints/create_machine_fields.html'
    );
  });

  it('Pick data', () => {
    cy.get('mist-form')
      .find('#machine_container')
      .within(() => {
        cy.get('#cloud').within(() => {
          cy.get('paper-dropdown-menu').click();
          cy.get('paper-dropdown-menu')
            .find('paper-item')
            .eq(1)
            .click({ force: true });

            cy.get('paper-dropdown-menu').then($el => {
              const el = $el[0]; // get the DOM element from the jquery element
              expect(el.value).to.equal('Cloud 1');
            });

        });
        cy.get('#location').within(() => {
          cy.get('paper-dropdown-menu').click();
          cy.get('paper-dropdown-menu')
            .find('paper-item')
            .first()
            .click({ force: true });
        });

        cy.get('#name')
          .find('input')
          .first()
          .clear({ force: true })
          .type('test', { force: true });

        cy.get('mist-form-checkbox#show').find('paper-checkbox').click();
        cy.paperTextAreaType('#message', 'Message');
      });
  });

  it('Clicking submit button should give {"machine":{"cloud":"cloudId1","location":"location1","name":"test","show":true,"msg":"Message"}}', () => {
    cy.wait(1000);
    cy.get('mist-form').find('.submit-btn').click();
    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(el.value).to.deep.equal({
        machine: {
          cloud: 'cloudId1',
          location: 'location1',
          name: 'test',
          show: true,
          msg: 'Message',
        },
      });
    });
  });

  it('Select different cloud', () => {
    cy.get('mist-form')
      .find('#machine_container')
      .within(() => {
        cy.get('#cloud').within(() => {
          cy.get('paper-dropdown-menu').click();
          cy.get('paper-dropdown-menu')
            .find('paper-item')
            .eq(2)
            .click({ force: true });

            cy.get('paper-dropdown-menu').then($el => {
              const el = $el[0]; // get the DOM element from the jquery element
              expect(el.value).to.equal('Cloud 2');
            });
        });
      });
  });
  it('Clicking submit button should give {"machine":{"cloud":"cloudId2"}', () => {
    cy.wait(1000);
    cy.get('mist-form').find('.submit-btn').click();
    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(el.value).to.deep.equal({ machine: { cloud: 'cloudId2' } });
    });
  });
});
