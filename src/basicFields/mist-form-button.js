import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';

import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormButton extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
      disabled: { type: Boolean, reflect: true },
    };
  }

  static get styles() {
    return css``;
  }

  validate() {
    return true;
  }

  valueChanged() {
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  setDisabled(disabled) {
    this.disabled = disabled;
  }

  connectedCallback() {
    super.connectedCallback();
    this.name = this.props.name;
    this.disabled = !!this.props.disabled;

    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
    this.style.display = this.props.hidden ? 'none' : 'inherit';
    this.fieldPath = this.props.fieldPath;
    return html` <paper-button
      class="${this.props.classes || ''} btn-block"
      raised
      @tap="${this.valueChanged}"
      ...="${spreadProps(util.getConvertedProps(this.props))}"
      .disabled=${this.disabled}
      fieldPath="${this.props.fieldPath}"
      >${this.props.label}</paper-button
    >`;
  }
}

customElements.define('mist-form-button', MistFormButton);
