import { LitElement, html, css } from 'lit-element';

class MistFormCodeBlock extends LitElement {
  static get properties() {
    return {
      value: { type: Object },
      isOpen: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        display: none;
      }
    `;
  }

  constructor() {
    super();
    this.value = {};
    this.isOpen = false;
  }

  render() {
    const formattedValue = JSON.stringify(this.value, null, 2);
    this.style = this.isOpen ? 'display: block;' : 'display: none;';
    return html`
      <pre>
          <code>&#10;${formattedValue}
          </code>
      </pre>
    `;
  }
}

customElements.define('mist-form-code-block', MistFormCodeBlock);
