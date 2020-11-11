import { fixture, expect } from '@open-wc/testing';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-styles/demo-pages.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-spinner/paper-spinner.js';

import { FieldTemplates } from '../src/FieldTemplates.js';
// mistForm object stub
const mistForm = { dispatchValueChangedEvent: () => {} };

describe('Individual paper Fields', () => {
  it('FieldTemplates.dropdown(name, props, mistForm) returns a <paper-dropdown-menu></paper-dropdown-menu> element', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      format: 'dropdown',
      enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
    };
    const template = FieldTemplates.dropdown(name, props, mistForm);
    const el = await fixture(template);
    expect(el.tagName).to.equal('PAPER-DROPDOWN-MENU');
  });

  it('FieldTemplates.radioGroup(name, props, mistForm) returns a <paper-radio-group></paper-radio-group> element', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      format: 'radioGroup',
      enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
    };
    const template = FieldTemplates.radioGroup(name, props, mistForm);
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-RADIO-GROUP');
  });

  it('FieldTemplates.boolean(name, props, mistForm) returns a <paper-toggle-button></paper-toggle-button> (switch)element', async () => {
    const name = 'title';
    const props = {
      label: 'Check this',
      id: 'order7',
      type: 'boolean',
    };
    const template = FieldTemplates.boolean(name, props, mistForm);
    const el = await fixture(template);
    expect(el.tagName).to.equal('PAPER-TOGGLE-BUTTON');
  });

  it('FieldTemplates.button() returns a <paper-button></paper-button> element', async () => {
    const template = FieldTemplates.button();
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-BUTTON');
  });

  it('FieldTemplates.spinner returns a <paper-spinner></paper-spinner> element', async () => {
    const template = FieldTemplates.spinner;
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-SPINNER');
  });

  it('FieldTemplates.string(name, props, mistForm) returns a <paper-textarea></paper-textarea> element if props.format is "textarea"', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      format: 'textarea',
    };
    const template = FieldTemplates.string(name, props, mistForm);
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-TEXTAREA');
  });

  it('FieldTemplates.string(name, props, mistForm) returns a <paper-dropdown-menu></paper-dropdown-menu> element if props contain "enum" and format is "dropdown" ', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      format: 'dropdown',
      enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
    };
    const template = FieldTemplates.string(name, props, mistForm);
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-DROPDOWN-MENU');
  });

  it('FieldTemplates.string(name, props, mistForm) returns a <paper-dropdown-menu></paper-dropdown-menu> element if props contain "enum" and format is undefined ', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
    };
    const template = FieldTemplates.string(name, props, mistForm);
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-DROPDOWN-MENU');
  });

  it('FieldTemplates.string(name, props, mistForm) returns a <paper-radio-group></paper-radio-group> element if props contain "enum" and format is "radioGroup"', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
      format: 'radioGroup',
      enum: ['Dr', 'Mr', 'Mrs', 'Ms'],
    };
    const template = FieldTemplates.string(name, props, mistForm);
    const el = await fixture(template);

    expect(el.tagName).to.equal('PAPER-RADIO-GROUP');
  });

  it('FieldTemplates.string(name, props, mistForm) returns a <paper-input></paper-input> element if props does not contain "enum"', async () => {
    const name = 'title';
    const props = {
      label: 'Title',
      id: 'order1',
      type: 'string',
    };
    const template = FieldTemplates.string(name, props, mistForm);
    const el = await fixture(template);
    expect(el.tagName).to.equal('PAPER-INPUT');
  });
});
