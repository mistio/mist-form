import { css, LitElement } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormIntegerField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: Number },
    };
  }

  static get styles() {
    return [
      css`
        vaadin-integer-field {
          width: 100%;
        }
      `,
    ];
  }

  get widget() {
    const w = super.widget;
    return w && w !== 'updown'
      ? w
      : (this.spec.jsonSchema.enum && 'radio') || 'integer';
  }

  cast(value) {
    if (value === undefined) {
      return parseInt(this.value, 10);
    }
    return parseInt(value, 10);
  }
}
customElements.define('mist-form-integer-field', MistFormIntegerField);
