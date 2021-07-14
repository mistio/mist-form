import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
import { FieldTemplateHelpers } from './FieldTemplateHelpers.js';
import './customFields/mist-form-duration-field.js';
import './customFields/multi-row.js';
import './customFields/custom-field.js';
import './basicFields/mist-form-checkbox-group.js';
import './basicFields/mist-form-checkbox.js';
import './basicFields/mist-form-dropdown.js';
import './basicFields/mist-form-radio-group.js';
import './basicFields/mist-form-text-area.js';
import './basicFields/mist-form-text-field.js';
import './basicFields/mist-form-subform.js';

export class FieldTemplates extends FieldTemplateHelpers {
  constructor(mistForm, valueChangedEvent) {
    super();
    this.mistForm = mistForm;
    this.valueChangedEvent = valueChangedEvent;
    this.inputFields = [
      'mist-form-text-dropdown',
      'mist-form-text-area',
      'mist-form-text-field',
      'mist-form-checkbox',
      'mist-form-radio-group',
      'mist-form-checkbox-group',
      'mist-form-duration-field',
      'paper-toggle-button',
      'mist-form-subform',
      'multi-row',
    ];
    this.customInputFields = [];
  }

  // Combine field and helpText and return template
  getTemplate(props) {
    const _props = { ...props };
    if (!_props.hidden) {
      const { fieldType, valueChangedEvent } = _props;
      _props.valueChangedEvent = valueChangedEvent || this.valueChangedEvent;
      if (this[fieldType]) {
        const template = this[fieldType](_props);
        return html` ${template}`;
      }
      console.error(`Invalid field type: ${fieldType}`);
    }
    return '';
  }

  // string(props) {
  //   const _props = { ...props };
  //   const hasEnum = Object.prototype.hasOwnProperty.call(_props, 'enum');

  //   // If value is array convert to string
  //   if (Array.isArray(_props.value)) {
  //     _props.value = _props.value.join(', ');
  //   }

  //   if (hasEnum) {
  //     const format = _props.format || 'dropdown';
  //     return this[format](_props);
  //     // Text area
  //   }
  //   if (_props.format !== 'number') {
  //     return this[_props.format || 'input'](_props);
  //     // Input field
  //   }
  //   return this.input(_props);
  // }

  dropdown = props =>
    html`<mist-form-dropdown
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-dropdown>`;

  radioGroup = props =>
    html`<mist-form-radio-group
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-radio-group>`;

  checkboxGroup = props =>
    html`<mist-form-checkbox-group
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-checkbox-group>`;

  input = props =>
    html`<mist-form-text-field
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-text-field>`;

  textArea = props =>
    html`<mist-form-text-area
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-text-area>`;

  boolean = props =>
    html`<mist-form-checkbox
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-checkbox>`;

  durationField = props =>
    html`<mist-form-duration-field
      class="${props.classes || ''} mist-form-input"
      ...="${spreadProps(props)}"
      @value-changed=${props.valueChangedEvent}
      fieldPath="${props.fieldPath}"
      .helpText=${this.helpText}
    ></mist-form-duration-field>`;

  multiRow = props => html`<multi-row
    ...="${spreadProps(props)}"
    .mistForm=${this.mistForm}
    .getValueProperty=${this.getValueProperty}
    .customInputFields=${this.customInputFields}
    @value-changed=${props.valueChangedEvent}
    exportparts="row: multirow-row"
    fieldPath="${props.fieldPath}"
    .fieldTemplates="${this}"
    .helpText=${this.helpText}
  ></multi-row>`;

  custom = props =>
    html`<mist-form-custom-field
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    >
    </mist-form-custom-field>`;

  subformContainer = props =>
    html`<mist-form-subform
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
    ></mist-form-subform>`;

  spinner = html`<paper-spinner active></paper-spinner>`;

  // Submit button should be disabled until all required fields are filled
  button = (
    title = 'Submit',
    tapFunc,
    isDisabled = false,
    className = ''
  ) => html` <paper-button
    class="${className} btn-block"
    raised
    @tap="${tapFunc}"
    ?disabled=${isDisabled}
    >${title}</paper-button
  >`;

  helpText = ({ helpUrl, helpText }) => {
    if (helpUrl) {
      return html` <div class="helpText">
        ${helpText}<a href="${helpUrl}" target="new">
          <paper-icon-button
            icon="icons:help"
            alt="open docs"
            title="open docs"
            class="docs"
          >
          </paper-icon-button>
        </a>
      </div>`;
    }
    if (helpText) {
      return html`<div class="helpText">${helpText}</div>`;
    }
    return '';
  };
}
