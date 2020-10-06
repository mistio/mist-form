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

  dispatchValueChangedEvent(field, value) {
    const { allOf } = this.data;
    allOf.forEach(el => {
      const condition = el.if.properties;
      const result = el.then.properties;
      // TODO: Find some better variable names...
      const ifPart = Object.keys(condition).map(key => [key, condition[key]]);
      const thenPart = Object.keys(result).map(key => [key, result[key]]);

      if (ifPart[0][0] === field && ifPart[0][1].const === value) {
        const input = this.shadowRoot.querySelector(
          `[name="${thenPart[0][0]}"]`
        );
        for (const [key, val] of Object.entries(thenPart[0][1])) {
          const convertedKey = FieldTemplates.convertPropName(key);
          input[convertedKey] = val;
        }
      }
    });
  }

  static _getTemplate(name, properties) {
    return FieldTemplates[properties.type]
      ? FieldTemplates[properties.type](name, properties)
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
    const params = [];

    this.shadowRoot
      .querySelectorAll(FieldTemplates.inputFields.join(','))
      .forEach(input => {
        const isValid = input.validate();
        if (!isValid) {
          allFieldsValid = false;
        } else {
          params.push({
            [input.id]:
              input.getAttribute('role') === 'checkbox'
                ? input.checked
                : input.value,
          });
        }
      });

    if (allFieldsValid) {
      const slot = this.shadowRoot
        .querySelector('slot[name="formRequest"]')
        .assignedNodes()[0];

      const event = new CustomEvent('mist-form-request', {
        detail: {
          params,
        },
      });
      slot.dispatchEvent(event);
    }
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;
      const inputs = Object.keys(jsonData).map(key => [key, jsonData[key]]);

      return html`
        <div>${this.data.label}</div>
        ${inputs.map(input => MistForm._getTemplate(input[0], input[1]))}
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
