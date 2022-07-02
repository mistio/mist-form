import { html, css, LitElement, render } from 'lit';
import { fieldMixin } from './mixin.js';
import '@vaadin/icons';
import '@vaadin/icon';

export class MistFormStringField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: String },
    };
  }

  static get styles() {
    return [
      css`
        label.field {
          font-weight: 500;
          display: inline-flex;
          margin: 16px 0 8px;
          color: rgba(27, 43, 65, 0.69);
          font-family: var(--lumo-font-family);
          font-size: 14px;
        }

        div.helper {
          display: block;
          color: var(--lumo-secondary-text-color);
          font-family: var(--lumo-font-family);
          font-size: var(--lumo-font-size-xs);
          line-height: var(--lumo-line-height-xs);
          margin-left: calc(var(--lumo-border-radius-m) / 4);
          transition: color 0.2s;
          margin: 8px 0;
        }
        div[slot='prefix'],
        div[slot='suffix'] {
          padding-top: 2px;
        }
      `,
    ];
  }

  get widget() {
    return (
      super.widget ||
      (this.spec.jsonSchema.examples && 'combo-box') ||
      (this.spec.jsonSchema.enum && 'select') ||
      (this.spec.jsonSchema.format === 'email' && 'email') ||
      (this.spec.jsonSchema.format === 'date-time' && 'datetime') ||
      (this.spec.jsonSchema.format === 'date' && 'date') ||
      (this.spec.jsonSchema.format === 'time' && 'time') ||
      (this.spec.jsonSchema.format === 'data-url' && 'file') ||
      'text-field'
    );
  }

  cast(value) {
    if (value === undefined && this.value !== undefined) {
      return this.cast(this.value);
    }
    return String(value || '');
  }

  renderer(root) {
    render(
      html`
        <vaadin-list-box>
          ${this.items
            ? this.items.map(
                item =>
                  html`<vaadin-item value="${item.value}"
                    >${item.label}</vaadin-item
                  >`
              )
            : ''}
        </vaadin-list-box>
      `,
      root
    );
  }
}

customElements.define('mist-form-string-field', MistFormStringField);
