describe('Expiration constraints', () => {
  it('Opens constraints form', () => {
    cy.visit('http://localhost:8000/demo/constraints/constraints.html');
  });

  it('expiration constraints subform should be hidden', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container')
      .should('not.have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .should('not.have.attr', 'active');
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .should('contain', 'Expiration constraints');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('paper-input')
      .should('not.exist');
  });

  it('Clicking on expiration toggle shows expiration subform', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container > paper-toggle-button')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container')
      .find('.subform-container')
      .should('have.class', 'open');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#default')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions > #available')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions > #default_action')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #require')
      .should('be.visible');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #message')
      .should('be.visible');
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Clicking submit with empty expiration subform values should return no available actions and notify>require false', () => {
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({ expiration: { notify: { require: false } } })
      );
    });
  });

  it('Typing invalid fields in expiration constraints should disable submit button', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .find('input')
      .first()
      .clear({ force: true })
      .type('0', { force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .find('input')
      .first()
      .clear({ force: true });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#default')
      .find('input')
      .first()
      .clear({ force: true })
      .type('10', { force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#default')
      .find('input')
      .first()
      .clear({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .find('input')
      .first()
      .clear({ force: true })
      .type('100', { force: true });
    cy.get('mist-form').find('.submit-btn').should('have.attr', 'disabled');
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .find('input')
      .first()
      .clear({ force: true });
    cy.get('mist-form').find('.submit-btn').should('not.have.attr', 'disabled');
  });

  it('Clicking submit button should give object', () => {
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .find('input')
      .first()
      .clear({ force: true })
      .type('100', { force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .find('paper-dropdown-menu')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#max')
      .find('paper-dropdown-menu')
      .find('paper-item')
      .eq(1)
      .click({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#default')
      .find('input')
      .first()
      .clear({ force: true })
      .type('20', { force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#default')
      .find('paper-dropdown-menu')
      .find('paper-item')
      .eq(2)
      .click({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions > #available')
      .find('#checkbox')
      .first()
      .click({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions > #available')
      .find('#checkbox')
      .eq(2)
      .click({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions')
      .find('paper-dropdown-menu')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_actions')
      .find('paper-dropdown-menu')
      .find('paper-item')
      .eq(1)
      .click({ force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .find('input')
      .first()
      .clear({ force: true })
      .type('100', { force: true });
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .find('paper-dropdown-menu')
      .click();
    cy.get('mist-form')
      .find('#expiration_constraint_container ')
      .find('#expiration_notify > #default')
      .find('paper-dropdown-menu')
      .find('paper-item')
      .eq(2)
      .click({ force: true });
    cy.paperTextAreaType('#expiration_constraint_container ').find(
      '#expiration_notify > #message',
      'Test'
    );
    cy.get('mist-form').find('.submit-btn').click();

    cy.get('mist-form').then($el => {
      const el = $el[0]; // get the DOM element from the jquery element
      expect(JSON.stringify(el.value)).to.equal(
        JSON.stringify({
          expiration: {
            max: '100mo',
            default: '20d',
            actions: {
              available: ['destroy', 'undefine'],
              default: 'undefine',
            },
            notify: {
              default: '100d',
              require: false,
              msg: 'Test',
            },
          },
        })
      );
    });
  });
});
