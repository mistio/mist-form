import { html, css, LitElement } from 'lit';
import { fieldMixin } from './mixin.js';

export class MistFormObjectField extends fieldMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--mist-form-text-color, #000);
        margin-bottom: 16px;
      }

      mist-form {
        padding: 0 10px;
        border-left: 4px dotted rgba(0, 0, 0, 0.03);
        /* border-bottom: 4px dotted rgba(0,0,0,0.03); */
        opacity: 1;
        display: block;
      }
      h1,
      h2,
      h3 {
        margin-bottom: 0;
      }
    `;
  }

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
    this.addEventListener('subform-data-changed', this.valueChanged);
  }

  disconnectedCallback() {
    this.removeEventListener('subform-data-changed', this.valueChanged);
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
    const toggler = this.hasToggle
      ? html`<h2>
            <paper-toggle-button
              ?checked=${this.enabled}
              @checked-changed=${this._toggleChanged}
              >${this.spec.jsonSchema.title}</paper-toggle-button
            >
          </h2>
          <p>${this.spec.jsonSchema.description}</p>`
      : html``;

    return html`${toggler}<mist-form
        subform
        ?toggles=${this.hasToggle}
        .jsonSchema=${this.spec.jsonSchema}
        .uiSchema=${this.spec.uiSchema}
        .formData=${this.spec.formData}
        .style=${this.css}
      ></mist-form>`;
  }

  get domValue() {
    if (!this.enabled) return {};
    const subform = this.shadowRoot.querySelector('mist-form');
    if (!subform) return undefined;
    return subform.domValue;
  }

  _toggleChanged(e) {
    const form = this.shadowRoot.querySelector('mist-form');
    if (form && form.enabled !== e.detail.value) {
      form.enabled = e.detail.value;
      if (
        this.spec.uiSchema &&
        this.spec.uiSchema['ui:enabled'] !== undefined
      ) {
        this.spec.uiSchema['ui:enabled'] = form.enabled;
      }
    }
  }
}
customElements.define('mist-form-object-field', MistFormObjectField);
