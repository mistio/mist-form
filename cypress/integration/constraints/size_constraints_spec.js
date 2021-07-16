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
      .find('.subform-container > paper-toggle-button')
      .should('not.have.attr', 'active');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .should('contain', 'Size constraints');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('paper-input')
      .should('not.exist');
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
      .find('#allowed')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#not_allowed')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .should('exist');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#min')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#max')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#show')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .should('exist');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#min')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#max')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#show')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .should('exist');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#min')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#max')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#show')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .should('exist');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#min')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#max')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#show')
      .should('be.visible');
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
      .find('#cpu_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#show')
      .should('be.visible');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
  });

  it('Clicking submit button should give object', () => {
    // cy.paperTextAreaType(
    //   '#size_constraint_container > .subform-container > #allowed',
    //   'test1, test2, test3'
    // );
    cy.get('#size_constraint_container')
      .find('.subform-container')
      .find('#allowed')
      .invoke('value', 'test1, test2, test3');
    cy.paperTextAreaType('#size_constraint_container')
      .find('.subform-container')
      .find('paper-text-area', 'test4');
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type(100, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type(200, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#cpu_constraint')
      .find('#show')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type(100, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#ram_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type(200, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type(100, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type(200, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#primary_disk_constraint')
      .find('#show')
      .click();
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#min')
      .find('input')
      .clear({ force: true })
      .type(100, { force: true });
    cy.get('mist-form')
      .find('#size_constraint_container')
      .find('.subform-container')
      .find('#swap_disk_constraint')
      .find('#max')
      .find('input')
      .clear({ force: true })
      .type(200, { force: true });
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
