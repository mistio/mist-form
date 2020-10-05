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
    return FieldTemplates[properties.type]
      ? FieldTemplates[properties.type](properties)
      : console.error(`Invalid field type: ${properties.type}`);
  }

  static _displayCancelButton(canClose = true) {
    if (canClose) {
      return FieldTemplates.button('Cancel');
    }
    return '';
  }

  _submitForm() {
    let allFieldsValid = true;
    this.shadowRoot.querySelectorAll('paper-input').forEach(input => {
      const isValid = input.validate();
      if (!isValid) {
        allFieldsValid = false;
      }
    });

    if (allFieldsValid) {
      // TODO: Make this generic and not specific to iron-ajax
      const slot = this.shadowRoot
        .querySelector('slot[name="formRequest"]')
        .assignedNodes()[0];

      const formRequestEvent = new CustomEvent('mist-form-request');
      slot.dispatchEvent(formRequestEvent);
    }
  }

  render() {
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
        <slot name="formRequest"></slot>
      `;
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return FieldTemplates.spinner;
  }
}
