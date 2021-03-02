import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';

// TODO: For now I only spread props, I should spread attributes too
// TODO: This file is starting to get too big. Maybe I should split it up
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

const getLabel = props => (props.required ? `${props.label} *` : props.label);

export const FieldTemplates = {
  getInputFields: () => [
    'paper-dropdown-menu',
    'paper-textarea',
    'paper-input',
    'paper-toggle-button',
    'paper-radio-group',
  ],
  string(name, props, mistForm, cb) {
    const isDynamic = Object.prototype.hasOwnProperty.call(
      props,
      'x-mist-enum'
    );
    const hasEnum = Object.prototype.hasOwnProperty.call(props, 'enum');
    // If a field has dynamic data, load the data and then re-render as a normal dropdown
    if (isDynamic && !hasEnum) {
      // Expect the response of a promise and pass the data to a callback that updates the enum property of the field
      mistForm.loadDynamicData(props, cb);
      // Dropdown
    } else if (hasEnum) {
      const format = props.format || 'dropdown';
      return FieldTemplates[format](name, props, mistForm);
      // Text area
    } else if (props.format === 'textarea') {
      return this.textArea(name, props, mistForm);
      // Input field
    } else {
      return this.input(name, props, mistForm);
    }
    return FieldTemplates.spinner;
  },
  dropdown: (name, props, mistForm) => html`<paper-dropdown-menu
    .name=${name}
    ...="${spreadProps(props)}"
    .label="${getLabel(props)}"
    @value-changed=${mistForm.dispatchValueChangedEvent}
  >
    <paper-listbox class="dropdown-content" slot="dropdown-content">
      ${props.enum.map(item => html`<paper-item>${item}</paper-item>`)}
    </paper-listbox>
  </paper-dropdown-menu>`,
  radioGroup: (name, props, mistForm) => html` <paper-radio-group
    .name=${name}
    ...="${spreadProps(props)}"
    .label="${getLabel(props)}"
    @selected-changed=${mistForm.dispatchValueChangedEvent}
  >
    <label>${getLabel(props)}</label>
    ${props.enum.map(
      item =>
        html`<paper-radio-button .id=${item.split(' ').join('-')}
          >${item}</paper-radio-button
        >`
    )}
  </paper-radio-group>`,
  input: (name, props, mistForm) => html`<paper-input
    .name=${name}
    @value-changed=${mistForm.dispatchValueChangedEvent}
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${getLabel(props)}"
  >
    ${props.prefix && html`<div slot="prefix">${props.prefix}</div>`}
    ${props.suffix && html`<div slot="suffix">${props.suffix}</div>`}
  </paper-input>`,
  textArea: (name, props, mistForm) => html`<paper-textarea
    .name=${name}
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${getLabel(props)}"
    @value-changed=${mistForm.dispatchValueChangedEvent}
  ></paper-textarea>`,
  boolean: (name, props, mistForm) => html`<paper-toggle-button
    .name=${name}
    ...="${spreadProps(props)}"
    @checked-changed=${mistForm.dispatchValueChangedEvent}
    value=""
    >${props.label}</paper-toggle-button
  >`,
  spinner: html`<paper-spinner active></paper-spinner>`,
  // Submit button should be disabled until all required fields are filled
  button: (title = 'Submit', tapFunc, isDisabled = false) => html` <paper-button
    class="submit-btn btn-block"
    raised
    @tap="${tapFunc}"
    ?disabled=${isDisabled}
    >${title}</paper-button
  >`,
  helpText: ({ helpUrl, helpText }) =>
    helpUrl
      ? html` <div>
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
      : html`<div>${helpText}</div>`,
};
