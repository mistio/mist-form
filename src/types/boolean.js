import { html, LitElement, render } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormBooleanField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: Boolean },
    };
  }

  get domValue() {
    const field = this.shadowRoot.querySelector('.mist-form-field');
    // if (field.value !== undefined) return Boolean(field.value);
    if (!field) return undefined;
    if (this.widget === 'select') {
      if (field.value === 'false' || !field.value) return false;
      return true;
    }
    if (this.widget === 'radio') {
      if (field.value === 'false' || !field.value) return false;
      return true;
    }
    return Boolean(field && field.checked);
  }

  get widget() {
    return super.widget || 'checkboxes';
  }

  get items() {
    if (!this.spec.jsonSchema) return [];
    return [
      {
        value: true,
        label: 'Yes',
      },
      {
        value: false,
        label: 'No',
      },
    ];
  }

  cast(value) {
    if (value === undefined && this.value !== undefined) {
      return this.cast(this.value);
    }
    return Boolean(value);
  }

  renderer(root) {
    render(
      html`
        <vaadin-list-box>
          ${this.items.map(
            item =>
              html`<vaadin-item value="${item.value}"
                >${item.label}</vaadin-item
              >`
          )}
        </vaadin-list-box>
      `,
      root
    );
  }
}
customElements.define('mist-form-boolean-field', MistFormBooleanField);
