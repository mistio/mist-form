import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
import './customFields/duration-field.js';
import './customFields/field-element.js';

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
    'paper-checkbox',
    'paper-radio-group',
    'iron-selector.checkbox-group',
    'duration-field',
    'field-element',
    'div.subform-container',
  ],
  string(name, props, mistForm, cb) {
    const _props = { ...props };
    const isDynamic = Object.prototype.hasOwnProperty.call(
      _props,
      'x-mist-enum'
    );
    const dynamicData = mistForm.dynamicFieldData[_props.fieldPath];
    if (isDynamic && dynamicData) {
      _props.enum = dynamicData;
    }
    const hasEnum = Object.prototype.hasOwnProperty.call(_props, 'enum');
    // If a field has dynamic data, load the data and then re-render as a normal dropdown
    if (isDynamic && dynamicData === undefined) {
      // Expect the response of a promise and pass the data to a callback that updates the enum property of the field
      mistForm.loadDynamicData(_props['x-mist-enum'], cb);
      // Dropdown
    } else if (hasEnum) {
      const format = _props.format || 'dropdown';
      return FieldTemplates[format](name, _props, mistForm);
      // Text area
    } else if (_props.format === 'textarea') {
      return this.textArea(name, _props, mistForm);
      // Input field
    } else {
      return this.input(name, _props, mistForm);
    }
    return FieldTemplates.spinner;
  },
  dropdown: (name, props, mistForm) => html`<paper-dropdown-menu
    .name=${name}
    ...="${spreadProps(props)}"
    .label="${getLabel(props)}"
    ?excludeFromPayload="${props.excludeFromPayload}"
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
    ?excludeFromPayload="${props.excludeFromPayload}"
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
  checkboxGroup: (name, props, mistForm) => html`
    <iron-selector
      .name=${name}
      ...="${spreadProps(props)}"
      .label="${getLabel(props)}"
      ?excludeFromPayload="${props.excludeFromPayload}"
      @selected-values-changed=${mistForm.dispatchValueChangedEvent}
      class="checkbox-group"
      attr-for-selected="key"
      selected-attribute="checked"
      multi
    >
      ${props.enum.map(
        item =>
          html`<paper-checkbox .id=${item.split(' ').join('-')} key="${item}"
            >${item}</paper-checkbox
          >`
      )}
    </iron-selector>
  `,
  input: (name, props, mistForm) => html`<paper-input
    .name=${name}
    @value-changed=${mistForm.dispatchValueChangedEvent}
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${getLabel(props)}"
    ?excludeFromPayload="${props.excludeFromPayload}"
  >
    ${props.prefix && html`<div slot="prefix">${props.prefix}</div>`}
    ${props.suffix && html`<div slot="suffix">${props.suffix}</div>`}
  </paper-input>`,
  textArea: (name, props, mistForm) => html`<paper-textarea
    .name=${name}
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${getLabel(props)}"
    ?excludeFromPayload="${props.excludeFromPayload}"
    @value-changed=${mistForm.dispatchValueChangedEvent}
  ></paper-textarea>`,
  boolean: (name, props, mistForm) => html`<paper-checkbox
    .name=${name}
    ...="${spreadProps(props)}"
    @checked-changed=${mistForm.dispatchValueChangedEvent}
    ?excludeFromPayload="${props.excludeFromPayload}"
    value=""
    >${props.label}</paper-checkbox
  >`,
  // TODO: Add send changed event to mistform
  durationField: (name, props) =>
    html`<duration-field
      .name=${name}
      ...="${spreadProps(props)}"
    ></duration-field>`,
  // TODO: Add send changed event to mistform
  fieldElement: (name, props) =>
    html`<field-element
      .name=${name}
      ...="${spreadProps(props)}"
    ></field-element>`,
  // Subform container
  object: (name, props, mistForm) => {
    // TODO: Setting props.fieldsVisibile isn't so good. I'm assigning to the property of a function parameter.
    // In addition to the hidden property, subforms have a fieldsVisible property which hides/shows the contents of the subform (excluding it's toggle)
    // TODO: Add/Remove class to subform when showing/hiding subform contents for styling
    const showFields = props.fieldsVisible || !props.hasToggle;
    return html`<div
      id="${props.id}-subform"
      ...="${spreadProps(props)}"
      name=${props.name}
      ?excludeFromPayload="${!showFields}"
      class="subform-container ${props.fieldsVisible ? 'open' : ''}"
    >
      <span class="subform-name">${!props.hasToggle ? props.label : ''}</span>

      ${props.hasToggle &&
      html` <paper-toggle-button
        .name="${props.name}-toggle"
        excludeFromPayload
        .checked="${props.fieldsVisible}"
        @checked-changed="${e => {
          props.fieldsVisible = e.detail.value;
          mistForm.requestUpdate();
        }}"
        >${props.label}</paper-toggle-button
      >`}
      ${showFields ? html`${props.inputs}` : ''}
    </div>`;
  },
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
