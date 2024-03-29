import { html, css, LitElement, render } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormBooleanField extends fieldMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        display: block;
      }
      paper-toggle-button {
        --paper-toggle-button-checked-bar-color: var(--paper-blue-600);
        --paper-toggle-button-checked-button-color: var(--paper-blue-600);
        --paper-toggle-button-checked-ink-color: var(--paper-blue-600);
      }
      label.field,
      span.field {
        font-weight: 500;
        display: block;
        margin: 16px 0 8px;
        color: rgba(27, 43, 65, 0.69);
        font-family: var(--lumo-font-family);
        font-size: 0.8125rem;
      }
    `;
  }

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
