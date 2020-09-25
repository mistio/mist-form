import { html, css, LitElement } from 'lit-element';

export class TextInput extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--mist-form-text-color, #000);
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      id: { type: String },
      required: { type: Boolean },
    };
  }

  render() {
    return html`
      <label for="${this.id}">${this.title}:</label><br />
      <input
        type="text"
        id="${this.id}"
        name="${this.id}"
        placeholder=${this.title}
        ?required=${this.required}
      />
    `;
  }
}

window.customElements.define('text-input', TextInput);
