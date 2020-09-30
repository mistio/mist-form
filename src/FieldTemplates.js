import { spreadProps } from '@open-wc/lit-helpers';
import { html } from 'lit-element';
// TODO: For now I only spread props, I should spread attributes too
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
      ...="${spreadProps(props)}"
    ></paper-input> `;
  },
  boolean: props =>
    html`<paper-checkbox ...="${spreadProps(props)}"
      >${props.label}</paper-checkbox
    >`,
};
