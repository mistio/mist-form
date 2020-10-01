import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // TODO: Check if this is the right place to load the JSON file?
    this._getJSON(this.src);
  }

  _getJSON(url) {
    // TODO: Validate data, add nicer loader, do something if data isn't valid
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data;
      });
  }

  static _getTemplate(properties) {
    // TODO: Do something if the fieldType doesn't exist or just ignore?
    return (
      FieldTemplates[properties.fieldType] &&
      FieldTemplates[properties.fieldType](properties)
    );
  }

  _submitForm() {
    this.shadowRoot.querySelectorAll('paper-input').forEach(input => {
      input.validate();
    });
  }

  _closeForm() {
    // TODO: This should actually close the form
    console.log(this);
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
        <div>${this.data.label}</div>
        ${inputs.map(input => MistForm._getTemplate(input[1]))}
        <div>
          <paper-button
            class="submit-btn btn-block"
            ?hidden=${this.data.noClose}
            raised
            @tap="${this._closeForm}"
            >Cancel</paper-button
          >

          <paper-button
            class="submit-btn btn-block"
            raised
            @tap="${this._submitForm}"
            >Submit</paper-button
          >
        </div>
      `;
    }
    return FieldTemplates.spinner;
  }
}
