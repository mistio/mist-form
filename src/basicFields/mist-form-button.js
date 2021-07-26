import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';
import * as util from '../utilities.js';

class MistFormButton extends elementBoilerplateMixin(LitElement) {
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

  setDisabled(disabled) {
    this.disabled = disabled;
  }

  connectedCallback() {
    super.connectedCallback();
    this.disabled = !!this.props.disabled;
  }

  render() {
    super.render();
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
