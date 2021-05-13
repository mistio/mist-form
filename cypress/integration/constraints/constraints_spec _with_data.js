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
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('have.class', 'open');
  });
  it('Check that subforms toggle correctly', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#cost_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#cost_constraint_container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#size_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#size_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#expiration_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .should('have.class', 'open');

    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#field_constraint_container paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#field_constraint_container')
      .should('have.class', 'open');
  });
  it('Check that data appears correctly for cost subform', () => {
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_team_run_rate')
      .find('input')
      .should('have.value', 100);
    cy.get('mist-form')
      .find('#cost_constraint_container > #cost_max_total_run_rate')
      .find('input')
      .should('have.value', 200);
  });
  it('Check that data appears correctly for size subform', () => {
    cy.get('mist-form')
      .find('#size_constraint_container > #cpu_constraint > #min')
      .find('input')
      .should('have.value', 100);
    cy.get('mist-form')
      .find('#size_constraint_container > #cpu_constraint > #max')
      .find('input')
      .should('have.value', 200);
    cy.get('mist-form')
      .find('#size_constraint_container > #cpu_constraint > #show')
      .should('not.have.attr', 'checked');
    cy.get('mist-form')
      .find('#size_constraint_container > #ram_constraint > #min')
      .find('input')
      .should('have.value', 200);
    cy.get('mist-form')
      .find('#size_constraint_container > #ram_constraint > #max')
      .find('input')
      .should('have.value', 300);
    cy.get('mist-form')
      .find('#size_constraint_container > #ram_constraint > #show')
      .should('not.have.attr', 'checked');
    cy.get('mist-form')
      .find('#size_constraint_container > #primary_disk_constraint > #min')
      .find('input')
      .should('have.value', 400);
    cy.get('mist-form')
      .find('#size_constraint_container > #primary_disk_constraint > #max')
      .find('input')
      .should('have.value', 500);
    cy.get('mist-form')
      .find('#size_constraint_container > #primary_disk_constraint > #show')
      .should('have.attr', 'checked');
    cy.get('mist-form')
      .find('#size_constraint_container > #swap_disk_constraint > #min')
      .find('input')
      .should('have.value', 600);
    cy.get('mist-form')
      .find('#size_constraint_container > #swap_disk_constraint > #max')
      .find('input')
      .should('have.value', 700);
    cy.get('mist-form')
      .find('#size_constraint_container > #swap_disk_constraint > #show')
      .should('have.attr', 'checked');
  });
  it('Check that data appears correctly for expiration subform', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container > #max')
      .find('input')
      .should('have.value', 100);
    cy.testPaperDropdownSelected(
      '#expiration_constraint_container > #max',
      'mo'
    );

    cy.get('mist-form')
      .find('#expiration_constraint_container > #default')
      .find('input')
      .should('have.value', 20);
    cy.get('mist-form');
    cy.testPaperDropdownSelected(
      '#expiration_constraint_container > #default',
      'd'
    );

    cy.get('mist-form')
      .find(
        '#expiration_constraint_container > #expiration_actions > #available'
      )
      .find('paper-checkbox#destroy')
      .should('have.attr', 'checked');
    cy.get('mist-form')
      .find(
        '#expiration_constraint_container > #expiration_actions > #available'
      )
      .find('paper-checkbox#stop')
      .should('not.have.attr', 'checked');
    cy.get('mist-form')
      .find(
        '#expiration_constraint_container > #expiration_actions > #available'
      )
      .find('paper-checkbox#undefine')
      .should('have.attr', 'checked');
    cy.testPaperDropdownSelected(
      '#expiration_constraint_container > #expiration_actions',
      'undefine'
    );

    cy.get('mist-form')
      .find('#expiration_constraint_container > #expiration_notify > #default')
      .find('input')
      .should('have.value', 100);
    cy.testPaperDropdownSelected(
      '#expiration_constraint_container > #expiration_notify > #default',
      'd'
    );
    cy.get('mist-form')
      .find('#expiration_constraint_container > #expiration_notify > #require')
      .should('have.attr', 'checked');
    cy.get('mist-form')
      .find('#expiration_constraint_container > #expiration_notify > #message')
      .find('textarea')
      .should('have.value', 'Test');
  });
  it('Check that data appears correctly in field subform', () => {
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .find('input')
      .first()
      .should('have.value', 'Field2');
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .find('input')
      .eq(1)
      .should('have.value', 'Value2');
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .find('input')
      .eq(2)
      .should('have.value', 'Field3');
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .find('paper-checkbox')
      .first()
      .should('not.have.attr', 'checked');
    cy.get('mist-form')
      .find('#field_constraint_container > field-element')
      .find('paper-checkbox')
      .last()
      .should('have.attr', 'checked');
  });

  it('Clicking submit button should give object', () => {
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
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
              show: false,
            },
            ram: {
              min: 200,
              max: 300,
              show: false,
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
              show: false,
            },
            {
              cloud: '',
              show: true,
              name: 'Field3',
              value: '',
            },
          ],
        })
      );
    });
  });
});
