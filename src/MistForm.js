import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
      dataError: { type: Object },
    };
  }

  firstUpdated() {
    this._getJSON(this.src);
  }

  _getJSON(url) {
    // TODO: Validate data,  do something if data isn't valid
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data;
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  static _getTemplate(properties) {
    // TODO: Do something if the fieldType doesn't exist or just ignore?
    return (
      FieldTemplates[properties.type] &&
      FieldTemplates[properties.type](properties)
    );
  }

  static _displayCancelButton(canClose = true) {
    if (canClose) {
      return FieldTemplates.button('Cancel');
    }
    return '';
  }

  _submitForm() {
    this.shadowRoot.querySelectorAll('paper-input').forEach(input => {
      input.validate();
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
        <div>${this.data.label}</div>
        ${inputs.map(input => MistForm._getTemplate(input[1]))}
        <div>
          ${MistForm._displayCancelButton(this.data.canClose)}
          ${FieldTemplates.button('Submit', this._submitForm)}
        </div>
      `;
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return FieldTemplates.spinner;
  }
}
