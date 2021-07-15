import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';

import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormCheckboxGroup extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
    };
  }

  static get styles() {
    return css``;
  }

  validate() {
    return true;
  }

  valueChanged(e) {
    this.props.valueChangedEvent(e);
    this.value = this.shadowRoot.querySelector('iron-selector').selectedValues;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
  }

  render() {
    return html`
      <iron-selector
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        @selected-values-changed=${this.valueChanged}
        class="${this.props.classes || ''} checkbox-group mist-form-input"
        attr-for-selected="key"
        selected-attribute="checked"
        multi
        fieldPath="${this.props.fieldPath}"
      >
        ${this.props.enum.map(
          item =>
            html`<paper-checkbox .id=${item.split(' ').join('-')} key="${item}"
                >${item}</paper-checkbox
              >${this.helpText(this.props)}`
        )}
      </iron-selector>
    `;
  }
}

customElements.define('mist-form-checkbox-group', MistFormCheckboxGroup);
