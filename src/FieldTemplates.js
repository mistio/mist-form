import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
// TODO: For now I only spread props, I should spread attributes too

// Some of the props need to be converted from their JSON Schema equivalents

const getConvertedProps = props => {
  const newProps = {
    ...props,
    max: props.maximum,
    min: props.minumum,
    type: props.format,
    multiple: props.multipleOf,
  };
  ['maximum', 'minimum', 'format', 'multipleOf'].forEach(
    e => delete newProps[e]
  );

  return newProps;
};
export const FieldTemplates = {
  inputFields: [
    'paper-dropdown-menu',
    'paper-textarea',
    'paper-input',
    'paper-checkbox',
  ],
  string: (name, props) => {
    if (Object.prototype.hasOwnProperty.call(props, 'enum')) {
      return html`<paper-dropdown-menu
        name=${name}
        ...="${spreadProps(props)}"
        @value-changed=${function (e) {
          const fieldName = e.path[0].name;
          const { value } = e.detail;
          // TODO: Check why this event gets fired twice
          this.dispatchValueChangedEvent(fieldName, value);
        }}
      >
        <paper-listbox slot="dropdown-content" selected="1">
          ${props.enum.map(item => html`<paper-item>${item}</paper-item>`)}
        </paper-listbox>
      </paper-dropdown-menu>`;
    }
    if (props.format === 'textarea') {
      return html`<paper-textarea
        name=${name}
        always-float-label
        ...="${spreadProps(getConvertedProps(props))}"
      ></paper-textarea>`;
    }
    return html`<paper-input
      name=${name}
      always-float-label
      ...="${spreadProps(getConvertedProps(props))}"
    ></paper-input>`;
  },
  boolean: (name, props) =>
    html`<paper-checkbox
      name=${name}
      ...="${spreadProps(props)}"
      @checked-changed=${function (e) {
        const fieldName = e.path[0].name;
        const { value } = e.detail;
        this.dispatchValueChangedEvent(fieldName, value);
      }}
      value=""
      >${props.label}</paper-checkbox
    >`,
  spinner: html`<paper-spinner active></paper-spinner>`,
  button: (title = 'Submit', tapFunc) => html` <paper-button
    class="submit-btn btn-block"
    raised
    @tap="${tapFunc}"
    >${title}</paper-button
  >`,
  convertPropName: propName => {
    const propMap = {
      maximum: 'max',
      minimum: 'min',
      format: 'type',
      multipleOf: 'multiple',
    };

    return propMap[propName] || propName;
  },
};
