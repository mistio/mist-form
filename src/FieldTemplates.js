import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
import {until} from 'lit-html/directives/until.js';
import './customFields/mist-form-duration-field.js';
import './customFields/multi-row.js';

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

const getLabel = props => (props.required ? `${props.label} *` : props.label);

export const FieldTemplates = {
  mistForm: null,
  valueChangedEvent: null,
  inputFields: [
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
  ],
  // Here we store the tag names of the custom components
  // and the name of their value changed events so we can detect
  // field changes
  //{ tagName: 'tag-name', valueChangedEvent: 'value-changed'}
  customInputFields: [],
  string: (props) => {
    const _props = { ...props };
    const isDynamic = Object.prototype.hasOwnProperty.call(
      _props,
      'x-mist-enum'
    );
    const dynamicData =
      FieldTemplates.mistForm.dynamicFieldData[_props.fieldPath];
    if (isDynamic && dynamicData) {
      _props.enum = dynamicData;
    }
    const hasEnum = Object.prototype.hasOwnProperty.call(_props, 'enum');
    // If value is array convert to string
    if (Array.isArray(_props.value)) {
      _props.value = _props.value.join(', ');
    }
    // If a field has dynamic data, load the data and then re-render as a normal dropdown
    if (isDynamic && dynamicData === undefined) {
      const dynamicEnumData = FieldTemplates.mistForm.loadDynamicData(_props['x-mist-enum']);
      return html`
      ${until(
        dynamicEnumData.then(enumData => {
          FieldTemplates.mistForm.dynamicDataNamespace[_props['x-mist-enum']].target =
            _props.fieldPath;
            FieldTemplates.mistForm.dynamicFieldData[_props.fieldPath] = enumData;

            const enumDataIncludesValue = enumData.some(item => item === _props.value || item.id === _props.value )
          if (!enumDataIncludesValue) {
            _props.value = null;
          }
          return enumData
          ? html `${FieldTemplates.dropdown({..._props, enum: enumData})}`
          : html`Not found`
        }),
        html`${FieldTemplates.spinner}`,
      )}`;
      // Dropdown
    }  else if (hasEnum) {
      const format = _props.format || 'dropdown';
      return FieldTemplates[format](_props);
      // Text area
    } else if (_props.format === 'textarea') {
      return FieldTemplates.textArea(_props);
      // Input field
    } else {
      return FieldTemplates.input(_props);
    }
  },
  dropdown: props => html`<paper-dropdown-menu
    ...="${spreadProps(props)}"
    .label="${getLabel(props)}"
    class="mist-form-input"
    ?excludeFromPayload="${props.excludeFromPayload}"
    no-animations=""
    attr-for-selected="value"
  >
    <paper-listbox
      attr-for-selected="value"
      selected="${props.value || ''}"
      class="dropdown-content"
      slot="dropdown-content"
      @value-changed=${FieldTemplates.valueChangedEvent}
    >
    ${until(
      props.enum.map(item =>
        html`
      <paper-item value="${item.id || item}">
        ${item.title || item}
      </paper-item>`
      )

      , html`<span>Loading...</span>`)}

    </paper-listbox>
  </paper-dropdown-menu>`,
  radioGroup: props => html` <paper-radio-group
    ...="${spreadProps(props)}"
    .label="${getLabel(props)}"
    class="mist-form-input"
    ?excludeFromPayload="${props.excludeFromPayload}"
    @selected-changed=${FieldTemplates.valueChangedEvent}
  >
    <label>${getLabel(props)}</label>
    ${props.enum.map(
      item =>
        html`<paper-radio-button .id=${item.split(' ').join('-')}
          >${item}</paper-radio-button
        >`
    )}
  </paper-radio-group>`,
  checkboxGroup: props => html`
    <iron-selector
      ...="${spreadProps(props)}"
      .label="${getLabel(props)}"
      ?excludeFromPayload="${props.excludeFromPayload}"
      @selected-values-changed=${FieldTemplates.valueChangedEvent}
      class="checkbox-group mist-form-input"
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
  input: props => {
    return html`<paper-input
      class="mist-form-input"
      @value-changed=${FieldTemplates.valueChangedEvent}
      always-float-label
      ...="${spreadProps(getConvertedProps(props))}"
      .label="${getLabel(props)}"
      ?excludeFromPayload="${props.excludeFromPayload}"
    >
      ${props.preffix && html`<span slot="prefix">${props.preffix}</span>`}
      ${props.suffix && html`<span slot="suffix">${props.suffix}</span>`}
    </paper-input>`;
  },
  textArea: props => html`<paper-textarea
    class="mist-form-input"
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${getLabel(props)}"
    ?excludeFromPayload="${props.excludeFromPayload}"
    @value-changed=${FieldTemplates.valueChangedEvent}
  ></paper-textarea>`,
  boolean: props => {
    return html`<paper-checkbox
    class="mist-form-input"
    ...="${spreadProps(props)}"
    @checked-changed=${FieldTemplates.valueChangedEvent}
    ?excludeFromPayload="${props.excludeFromPayload}"
    value=""
    >${props.label}</paper-checkbox
  >`
  },
  durationField: (props) =>
  html`<mist-form-duration-field

    class="mist-form-input"
    ...="${spreadProps(props)}"
    @value-changed=${FieldTemplates.valueChangedEvent}
  ></mist-form-duration-field>`,
  multiRow: props => {
    return html`<multi-row
      ...="${spreadProps(props)}"
      .mistForm=${FieldTemplates.mistForm}
      @value-changed=${FieldTemplates.valueChangedEvent}
    ></multi-row>`;
  },
  object: props => {
    // TODO: Setting props.fieldsVisibile isn't so good. I'm assigning to the property of a function parameter.
    // In addition to the hidden property, subforms have a fieldsVisible property which hides/shows the contents of the subform (excluding it's toggle)
    // TODO: Create component for subform which returns a value so I don't need to find the values in FieldTemplates.mistForm
    // Subform should be attached to subform container in json
    if (
      FieldTemplates.mistForm.getSubformState(props.fieldPath) === undefined
    ) {
      FieldTemplates.mistForm.setSubformState(
        props.fieldPath,
        props.fieldsVisible || !props.hasToggle
      );
    }
    const showFields = FieldTemplates.mistForm.getSubformState(props.fieldPath);
    return html`<div
      id="${props.id}-subform"
      ...="${spreadProps(props)}"
      ?excludeFromPayload="${!showFields}"
      class="subform-container ${showFields ? 'open' : ''} ${isEvenOrOdd(
        props.fieldPath
      )}"
    >
      <span class="subform-name">${!props.hasToggle ? props.label : ''}</span>

      ${props.hasToggle &&
      html` <paper-toggle-button
        .name="${props.name}-toggle"
        excludeFromPayload
        .checked="${showFields}"
        @checked-changed="${e => {
          FieldTemplates.mistForm.setSubformState(
            props.fieldPath,
            e.detail.value
          );
          FieldTemplates.mistForm.requestUpdate();
        }}"
        >${props.label}</paper-toggle-button
      >`}
      ${showFields ? html`${props.inputs}` : ''}
    </div>`;
  },
  spinner: html`<paper-spinner active></paper-spinner>`,
  // Submit button should be disabled until all required fields are filled
  button: (
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
  >`,
  helpText: ({ helpUrl, helpText }) =>
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
      : html`<div class="helpText">${helpText}</div>`,
};
