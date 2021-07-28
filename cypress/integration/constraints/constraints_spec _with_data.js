describe('Constraints form with data', () => {
  it('Opens constraints form', () => {
    cy.visit(
      'http://localhost:8000/demo/constraints/constraints_with_data.html'
    );
    cy.get('mist-form').find('.mist-header').contains('Constraints');
  });

  it('Add button is enabled, Cancel button is enabled', () => {
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form').find('.cancel-btn').should('not.have.attr', 'disabled');
  });
  it('Check that all subforms are open', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
  });
  it('Check that subforms toggle correctly', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
  });
  it('Check that data appears correctly for cost subform', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .within(() => {
        cy.get('#cost_max_team_run_rate')
          .find('input')
          .should('have.value', 100);
        cy.get('#cost_max_total_run_rate')
          .find('input')
          .should('have.value', 200);
      });
  });
  it('Check that data appears correctly for size subform', () => {
    cy.get('#cpu_constraint').within(() => {
      cy.get('#min').find('input').should('have.value', 100);
      cy.get('#max').find('input').should('have.value', 200);
      cy.get('#show').find('paper-checkbox').should('not.have.attr', 'checked');
    });

    cy.get('#ram_constraint').within(() => {
      cy.get('#min').find('input').should('have.value', 200);
      cy.get('#max').find('input').should('have.value', 300);
      cy.get('#show').find('paper-checkbox').should('not.have.attr', 'checked');
    });

    cy.get('#primary_disk_constraint').within(() => {
      cy.get('#min').find('input').should('have.value', 400);
      cy.get('#max').find('input').should('have.value', 500);
      cy.get('#show').find('paper-checkbox').should('have.attr', 'checked');
    });

    cy.get('#swap_disk_constraint').within(() => {
      cy.get('#min').find('input').should('have.value', 600);
      cy.get('#max').find('input').should('have.value', 700);
      cy.get('#show').find('paper-checkbox').should('have.attr', 'checked');
    });
  });
  it('Check that data appears correctly for expiration subform', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .within(() => {
        cy.get('#max').find('input').should('have.value', 100);
        cy.testPaperDropdownSelected('#max', 'mo');

        cy.get('#default')
          .find('paper-input')
          .find('input')
          .should('have.value', 20);
        cy.testPaperDropdownSelected('#default', 'd');

        cy.get('#expiration_actions').within(() => {
          cy.get('#available')
            .find('paper-checkbox#destroy')
            .should('have.attr', 'checked');
          cy.get('#available')
            .find('paper-checkbox#stop')
            .should('not.have.attr', 'checked');
          cy.get('#available')
            .find('paper-checkbox#undefine')
            .should('have.attr', 'checked');
          cy.wait(1000);
          cy.testPaperDropdownSelected('#default_action', 'undefine');
        });

        cy.get('#expiration_notify').within(() => {
          cy.get('#default').find('input').should('have.value', 100);
          cy.testPaperDropdownSelected('#default', 'd');
          cy.get('paper-checkbox#require').should('have.attr', 'checked');
          cy.get('#message').find('textarea').should('have.value', 'Test');
        });
      });
  });

  it('Check that data appears correctly in field subform', () => {
    cy.get('mist-form')
      .find('#field_constraint_container')
      .find('mist-form-multi-row')
      .within(() => {
        cy.get('mist-form-row')
          .first()
          .within(() => {
            cy.get('#name').find('input').should('have.value', 'Field2');
            cy.get('#value').find('input').should('have.value', 'Value2');
            cy.get('#show')
              .find('paper-checkbox')
              .should('not.have.attr', 'checked');
          });

        cy.get('mist-form-row')
          .eq(1)
          .within(() => {
            cy.get('#name').find('input').should('have.value', 'Field3');
            cy.get('#show')
              .find('paper-checkbox')
              .should('have.attr', 'checked');
          });
      });
  });

  it('Check that data appears correctly in custom subform', () => {
    cy.get('mist-form')
      .find('#custom_constraint_container')
      .within(() => {
        cy.get('mist-form-custom-field')
          .eq(0)
          .find('paper-slider')
          .should('have.value', 31);
        cy.get('mist-form-custom-field')
          .eq(1)
          .find('paper-slider')
          .should('have.value', 48);
        cy.get('mist-form-custom-field')
          .eq(2)
          .find('paper-swatch-picker')
          .then(el => {
            expect(el[0].color).to.equal('#81d4fa');
          });
      });
  });

  it('Clicking submit button should give object', () => {
    cy.wait(1000);
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(el.value).to.deep.equal({
        cost: {
          max_team_run_rate: 100,
          max_total_run_rate: 200,
        },
        size: {
          allowed: ['test1', 'test2', 'test3'],
          not_allowed: ['test4'],
          cpu: {
            min: 100,
            max: 200,
          },
          ram: {
            min: 200,
            max: 300,
          },
          disk: {
            min: 400,
            max: 500,
            show: true,
          },
          swap_disk: {
            min: 600,
            max: 700,
            show: true,
          },
        },
        expiration: {
          max: '100mo',
          default: '20d',
          actions: {
            available: ['destroy', 'undefine'],
            default: 'undefine',
          },
          notify: {
            default: '100d',
            require: true,
            msg: 'Test',
          },
        },
        field: [
          {
            cloud: 'cloudId2',
            name: 'Field2',
            value: 'Value2',
          },
          {
            show: true,
            name: 'Field3',
          },
        ],
        custom: {
          paperSlider1: 31,
          paperSlider2: 48,
          colorSwatch: '#81d4fa',
          hidePaperSlider1: 'No',
        },
      });
    });
  });
});
