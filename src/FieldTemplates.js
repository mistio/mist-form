import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
// TODO: For now I only spread props, I should spread attributes too

// Some of the props need to be converted because they conflict/are not equivalent to the JSON Schema attributes
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
  string: props => {
    if (Object.prototype.hasOwnProperty.call(props, 'enum')) {
      return html`<paper-dropdown-menu ...="${spreadProps(props)}">
        <paper-listbox slot="dropdown-content" selected="1">
          ${props.enum.map(item => html`<paper-item>${item}</paper-item>`)}
        </paper-listbox>
      </paper-dropdown-menu>`;
    }
    return html`<paper-input
      always-float-label
      ...="${spreadProps(getConvertedProps(props))}"
    ></paper-input> `;
  },
  textarea: props => html`<paper-textarea
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
  ></paper-textarea> `,
  boolean: props =>
    html`<paper-checkbox ...="${spreadProps(props)}"
      >${props.label}</paper-checkbox
    >`,
  spinner: html`<paper-spinner active></paper-spinner>`,
  button: (title = 'Submit', tapFunc) => html` <paper-button
    class="submit-btn btn-block"
    raised
    @tap="${tapFunc}"
    >${title}</paper-button
  >`,
};
