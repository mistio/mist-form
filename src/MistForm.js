import { html, LitElement } from 'lit-element';
import { ConditionalHandler } from './ConditionalHandler.js';
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
    const event = new CustomEvent('conditional-value-changed', {
      detail: {
        field,
        value,
      },
    });
    this.shadowRoot
      .querySelectorAll('conditional-handler')[0]
      .dispatchEvent(event);
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
        <conditional-handler
          @conditional-value-changed=${function (e) {
            ConditionalHandler.handleConditional(e);
          }}
        ></conditional-handler>
      `;
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return FieldTemplates.spinner;
  }
}
