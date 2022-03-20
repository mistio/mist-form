import { html, LitElement } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormObjectField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: Object },
    };
  }

  get errors() {
    return this.shadowRoot.querySelector('mist-form').errors;
  }

  get payload() {
    return this.shadowRoot.querySelector('mist-form').payload;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'subform-data-changed',
      this._handleSubformValueChanged
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      'subform-data-changed',
      this._handleSubformValueChanged
    );
    super.disconnectedCallback();
  }

  cast(value) {
    if (value === undefined) {
      return Object(this.value);
    }
    return Object(value);
  }

  render() {
    if (!this.spec) return html``;
    return html` <mist-form
      subform
      ?toggles=${this.hasToggle}
      .jsonSchema=${this.spec.jsonSchema}
      .uiSchema=${this.spec.uiSchema}
      .formData=${this.spec.formData}
    ></mist-form>`;
  }

  _handleSubformValueChanged(e) {
    console.debug(this, 'Updating form field', e);
    // let value = this.cast(e.detail.value);
    // if (!value && this.spec.uiSchema["ui:emptyValue"]) {
    //   value = this.spec.uiSchema["ui:emptyValue"]
    // }
    const valueChangedEvent = new CustomEvent('field-value-changed', {
      detail: {
        id: this.spec.id,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(valueChangedEvent);
    e.stopPropagation();
  }

  get domValue() {
    if (!this.enabled) return {};
    return this.shadowRoot.querySelector('mist-form').domValue;
  }
}
customElements.define('mist-form-object-field', MistFormObjectField);
