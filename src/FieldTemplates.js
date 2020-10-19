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
// TODO: Add radio group
export const FieldTemplates = {
  getInputFields: () => [
    'paper-dropdown-menu',
    'paper-textarea',
    'paper-input',
    'paper-toggle-button',
    'paper-radio-group',
  ],
  dropdown: (name, props) => {
    return html`<paper-dropdown-menu
      .name=${name}
      ...="${spreadProps(props)}"
      .label="${getLabel(props)}"
      @value-changed=${function (e) {
        // TODO: Check why this event gets fired twice sometimes, for instance when selecting a cloud
        this.dispatchValueChangedEvent(e);
      }}
    >
      <paper-listbox class="dropdown-content" slot="dropdown-content">
        ${props.enum.map(item => html`<paper-item>${item}</paper-item>`)}
      </paper-listbox>
    </paper-dropdown-menu>`;
  },
  radioGroup: (name, props) => html` <label>${getLabel(props)}</label>
    <paper-radio-group
      .name=${name}
      ...="${spreadProps(props)}"
      .label="${getLabel(props)}"
      @selected-changed=${function (e) {
        this.dispatchValueChangedEvent(e);
      }}
    >
      ${props.enum.map(
        item =>
          html`<paper-radio-button .id=${item.split(' ').join('-')}
            >${item}</paper-radio-button
          >`
      )}
    </paper-radio-group>`,
  string: (name, props, dynamicDataNamespace, cb) => {
    if (props.hidden) {
      return '';
    }
    // Value doesn't get updated when options change
    if (Object.prototype.hasOwnProperty.call(props, 'enum')) {
      const format = props.format || 'dropdown';
      return FieldTemplates[format](name, props);
    }
    if (Object.prototype.hasOwnProperty.call(props, 'x-mist-enum')) {
      // Excpect the response of a promise and then pass the values and render the dropdown
      console.log('dynamicDataNamespace ', dynamicDataNamespace);
      console.log("props['x-mist-enum'] ", props['x-mist-enum']);

      dynamicDataNamespace[props['x-mist-enum']]
        .then(enumData => {
          cb(enumData);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else if (props.format === 'textarea') {
      return html`<paper-textarea
        .name=${name}
        always-float-label
        ...="${spreadProps(getConvertedProps(props))}"
        .label="${getLabel(props)}"
        @value-changed=${function (e) {
          this.dispatchValueChangedEvent(e);
        }}
      ></paper-textarea>`;
    } else {
      return html`<paper-input
        .name=${name}
        @value-changed=${function (e) {
          this.dispatchValueChangedEvent(e);
        }}
        always-float-label
        ...="${spreadProps(getConvertedProps(props))}"
        .label="${getLabel(props)}"
      >
        ${props.prefix && html`<div slot="prefix">${props.prefix}</div>`}
        ${props.suffix && html`<div slot="suffix">${props.suffix}</div>`}
      </paper-input>`;
    }
    return FieldTemplates.spinner;
  },
  boolean: (name, props) => {
    if (props.hidden) {
      return '';
    }

    return html`<paper-toggle-button
      .name=${name}
      ...="${spreadProps(props)}"
      @checked-changed=${function (e) {
        this.dispatchValueChangedEvent(e);
      }}
      value=""
      >${props.label}</paper-toggle-button
    >`;
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
  helpText: (url, text) =>
    url
      ? html` <div>
          ${text}<a href="${url}" target="new">
            <paper-icon-button
              icon="icons:help"
              alt="open docs"
              title="open docs"
              class="docs"
            >
            </paper-icon-button>
          </a>
        </div>`
      : html`<div>${text}</div>`,
};
