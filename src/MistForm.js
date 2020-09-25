import { html, css, LitElement } from 'lit-element';
import './TextInput.js';

export class MistForm extends LitElement {
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
      src: { type: String },
      data: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // TODO: Check if this is the right place to load the JSON file?
    this.__getJSON(this.src);
  }

  __getJSON(url) {
    // TODO: Validate data, add nicer loader, do something if data isn't valid
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data;
      });
  }

  render() {
    // Map the inputs to the appropriate web component
    // For now we only have text inputs
    // TODO: Check why form validation isn't working
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;
      const inputs = Object.keys(jsonData).map(key => [key, jsonData[key]]);
      return html`
        <form action="">
          <h3>${this.title}</h3>
          ${inputs.map(input => {
            const { id, title, required } = input[1];
            return html`<text-input
              .id=${id}
              .title=${title}
              .required=${required}
            >
            </text-input>`;
          })}
          <input type="submit" />
        </form>
      `;
    }
    return 'Loading data...';
  }
}
