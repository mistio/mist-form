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

  valueChanged() {
    this.value = this.shadowRoot.querySelector('iron-selector').selectedValues;
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.name = this.props.name;
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
    this.style.display = this.props.hidden ? 'none' : 'inherit';
    this.fieldPath = this.props.fieldPath;
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
