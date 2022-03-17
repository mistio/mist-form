import { html, css, LitElement, render } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormNumberField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: Number },
    };
  }

  static get styles() {
    return [
      css`
        vaadin-number-field {
          width: 100%;
        }
      `,
    ];
  }

  get widget() {
    const w = super.widget;
    return w && w !== 'updown'
      ? w
      : (this.spec.jsonSchema.enum && 'select') || 'number';
  }

  get domValue() {
    const field = this.shadowRoot.querySelector('.mist-form-field');
    return field.value !== undefined
      ? this.cast(field.value)
      : this.cast(field.getAttribute('value'));
  }

  cast(value) {
    if (value === undefined) {
      return Number(this.value);
    }
    return Number(value);
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
customElements.define('mist-form-number-field', MistFormNumberField);
