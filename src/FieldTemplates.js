import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
import { until } from 'lit-html/directives/until.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { FieldTemplateHelpers } from './FieldTemplateHelpers.js';
import './customFields/mist-form-duration-field.js';
import './customFields/multi-row.js';
import './basicFields/mist-form-dropdown.js';

// TODO: For now I only spread props, I should spread attributes too
// TODO: Split up components in separate files. One file per component.

// Some of the props need to be converted from their JSON Schema equivalents
const getConvertedProps = props => {
  const newProps = {
    ...props,
    max: props.maximum,
    min: props.minimum,
    type: props.format,
    multiple: props.multipleOf,
  };
  ['maximum', 'minimum', 'format', 'multipleOf'].forEach(
    e => delete newProps[e]
  );

  return newProps;
};
const isEvenOrOdd = fieldPath =>
  fieldPath.split('.').length % 2 ? 'odd' : 'even';

export class FieldTemplates extends FieldTemplateHelpers {
  constructor(mistForm, valueChangedEvent) {
    super();
    this.mistForm = mistForm;
    this.valueChangedEvent = valueChangedEvent;
    this.inputFields = [
      'paper-dropdown-menu',
      'paper-textarea',
      'paper-input',
      'paper-toggle-button',
      'paper-checkbox',
      'paper-radio-group',
      'iron-selector.checkbox-group',
      'mist-form-duration-field',
      'div.subform-container',
      'multi-row',
    ];
    this.customInputFields = [];
  }

  string(props) {
    const _props = { ...props };
    const hasEnum = Object.prototype.hasOwnProperty.call(_props, 'enum');

    // If value is array convert to string
    if (Array.isArray(_props.value)) {
      _props.value = _props.value.join(', ');
    }

    if (hasEnum) {
      const format = _props.format || 'dropdown';
      return this[format](_props);
      // Text area
    }
    if (_props.format !== 'number') {
      return this[_props.format || 'input'](_props);
      // Input field
    }
    return this.input(_props);
  }

  dropdown = props => html`<mist-form-dropdown .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-dropdown>`;

  radioGroup = props => html`<mist-form-radio-group .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-radio-group>` ;

  checkboxGroup = props => html`<mist-form-checkbox-group .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-checkbox-group>`;

  input = props => html `<mist-form-text-field .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-text-field>`;

  textArea = props => html `<mist-form-text-area .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-text-area>`;

  boolean = props => html `<mist-form-checkbox .props="${props}" .valueChangedEvent=${props.valueChangedEvent || this.valueChangedEvent} .mistForm=${this.mistForm}></mist-form-checkbox>`;

  durationField = props =>
    html`<mist-form-duration-field
      class="${props.classes || ''} mist-form-input"
      ...="${spreadProps(props)}"
      @value-changed=${props.valueChangedEvent || this.valueChangedEvent}
      fieldPath="${props.fieldPath}"
    ></mist-form-duration-field>`;

  multiRow = props => html`<multi-row
    ...="${spreadProps(props)}"
    .mistForm=${this.mistForm}
    .getValueProperty=${this.getValueProperty}
    .customInputFields=${this.customInputFields}
    @value-changed=${props.valueChangedEvent || this.valueChangedEvent}
    exportparts="row: multirow-row"
    fieldPath="${props.fieldPath}"
  ></multi-row>`;

  object = props => {
    // In addition to the hidden property, subforms have a fieldsVisible property which hides/shows the contents of the subform (excluding it's toggle)
    // TODO: Create component for subform which returns a value so I don't need to find the values in this.mistForm
    // Subform should be attached to subform container in json
    if (this.mistForm.getSubformState(props.fieldPath) === undefined) {
      this.mistForm.setSubformState(
        props.fieldPath,
        props.fieldsVisible || !props.hasToggle
      );
    }
    const showFields = this.mistForm.getSubformState(props.fieldPath);
    return html`<div
      id="${props.id}-subform"
      ...="${spreadProps(props)}"
      ?excludeFromPayload="${!showFields}"
      class="${props.classes || ''} subform-container ${showFields
        ? 'open'
        : ''} ${isEvenOrOdd(props.fieldPath)}"
      fieldPath="${props.fieldPath}"
    >
      <span class="${props.classes || ''} subform-name"
        >${!props.hasToggle ? props.label : ''}</span
      >

      ${props.hasToggle &&
      html` <paper-toggle-button
        .name="${props.name}-toggle"
        excludeFromPayload
        .checked="${showFields}"
        @checked-changed="${e => {
          this.mistForm.setSubformState(props.fieldPath, e.detail.value);
          this.mistForm.requestUpdate();
        }}"
        >${props.label}</paper-toggle-button
      >`}
      ${showFields ? html`${props.inputs}` : ''}
    </div>`;
  };

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

  helpText = ({ helpUrl, helpText }) =>
    helpUrl
      ? html` <div class="helpText">
          ${helpText}<a href="${helpUrl}" target="new">
            <paper-icon-button
              icon="icons:help"
              alt="open docs"
              title="open docs"
              class="docs"
            >
            </paper-icon-button>
          </a>
        </div>`
      : html`<div class="helpText">${helpText}</div>`;
}
