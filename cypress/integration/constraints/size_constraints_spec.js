describe('Size constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('Size constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');

    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get(' paper-toggle-button').should('not.have.attr', 'active');
        cy.get(' paper-toggle-button').should('contain', 'Size constraints');
        cy.get('paper-input').should('not.exist');
      });
  });

  it('Clicking on size toggle shows size subform', () => {
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get('#allowed').should('be.visible');
        cy.get('#not_allowed').should('be.visible');

        cy.get('#cpu_constraint').should('exist');
        cy.get('#cpu_constraint').within(() => {
          cy.get('#min').should('be.visible');
          cy.get('#max').should('be.visible');
          cy.get('#show').should('be.visible');
        });

        cy.get('#ram_constraint').should('exist');
        cy.get('#ram_constraint').within(() => {
          cy.get('#min').should('be.visible');
          cy.get('#max').should('be.visible');
          cy.get('#show').should('be.visible');
        });

        cy.get('#primary_disk_constraint').should('exist');
        cy.get('#primary_disk_constraint').within(() => {
          cy.get('#min').should('be.visible');
          cy.get('#max').should('be.visible');
          cy.get('#show').should('be.visible');
        });

        cy.get('#swap_disk_constraint').should('exist');
        cy.get('#swap_disk_constraint').within(() => {
          cy.get('#min').should('be.visible');
          cy.get('#max').should('be.visible');
          cy.get('#show').should('be.visible');
        });
      });

    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Clicking submit with empty size subform values should only return true for show', () => {
    cy.get('mist-form').find('.submit-btn').click();
    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          size: {
            cpu: {
              show: true,
            },
            ram: {
              show: true,
            },
            disk: {
              show: true,
            },
            swap_disk: {
              show: true,
            },
          },
        })
      );
    });
  });

  it('Typing invalid fields in size constraints should disable submit button', () => {
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get('#cpu_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
          cy.get('#show').should('be.visible');
        });

        cy.get('#ram_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
        });

        cy.get('#primary_disk_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
        });

        cy.get('#swap_disk_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('0', { force: true });
        });
      });

    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Clicking submit button should give object', () => {
    cy.paperTextAreaType('mist-form-text-area#allowed', 'test1, test2, test3');
    cy.paperTextAreaType('mist-form-text-area#not_allowed', 'test4');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .within(() => {
        cy.get('#cpu_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('100', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('200', { force: true });
          cy.get('mist-form-checkbox#show').should('be.visible');
          cy.get('mist-form-checkbox#show').click();
        });

        cy.get('#ram_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('100', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('200', { force: true });
        });

        cy.get('#primary_disk_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('100', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('200', { force: true });
          cy.get('mist-form-checkbox#show').should('be.visible');
          cy.get('mist-form-checkbox#show').click();
        });

        cy.get('#swap_disk_constraint').within(() => {
          cy.get('#min')
            .find('input')
            .clear({ force: true })
            .type('100', { force: true });
          cy.get('#max')
            .find('input')
            .clear({ force: true })
            .type('200', { force: true });
        });
      });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          size: {
            allowed: ['test1', 'test2', 'test3'],
            not_allowed: ['test4'],
            cpu: {
              min: 100,
              max: 200,
              show: false,
            },
            ram: {
              min: 100,
              max: 200,
              show: true,
            },
            disk: {
              min: 100,
              max: 200,
              show: false,
            },
            swap_disk: {
              min: 100,
              max: 200,
              show: true,
            },
          },
        })
      );
    });
  });
});
