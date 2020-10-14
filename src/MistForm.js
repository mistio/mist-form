import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

// TODO: Clean up code when I'm done
// - Check if I actually need some functions to be static
// - Follow the same naming convention for functions
// -...

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      allFieldsValid: { type: Boolean },
      fieldsValid: { type: Object },
    };
  }

  constructor() {
    super();
    this.fieldsValid = {};
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

  toggleSubmitButton(fieldName, value) {
    this.fieldsValid[fieldName] = value;
    this.allFieldsValid = Object.values(this.fieldsValid).every(
      val => val === true
    );
  }

  _clearDropdown({ id, format }) {
    // TODO: Check if I need to do this for radio buttons
    if (this.shadowRoot.querySelector(`#${id}`)) {
      if (format === 'dropdown') {
        this.shadowRoot.querySelector(`#${id} paper-listbox`).selected = null;
      } else if (format === 'radioGroup') {
        // TODO
      }

      this.shadowRoot.querySelector(`#${id}`).value = null;
    }
  }

  dispatchValueChangedEvent(field, value) {
    // TODO: Show and hide subforms
    if (!this.data.allOf) {
      return;
    }

    let update = false;

    this.data.allOf.forEach(conditional => {
      const condition = conditional.if.properties;
      const result = conditional.then.properties;
      const conditionMap = Object.keys(condition).map(key => [
        key,
        condition[key],
      ]);
      const resultMap = Object.keys(result).map(key => [key, result[key]]);
      const targetField = conditionMap[0][0];
      const targetValues = conditionMap[0][1].enum || [
        conditionMap[0][1].const,
      ];
      if (targetField === field && targetValues.includes(value)) {
        update = true;
        resultMap.forEach(obj => {
          for (const [key, val] of Object.entries(obj[1])) {
            this.data.properties[obj[0]][key] = val;

            const props = this.data.properties[obj[0]];
            console.log('props ', props);
            if (Object.prototype.hasOwnProperty.call(props, 'enum')) {
              this._clearDropdown(props);
            }
          }
        });
      }
    });
    if (update) {
      this.requestUpdate();
    }
  }

  // TODO: Style helpText better
  static _getTemplate(name, properties) {
    if (!properties.hidden) {
      return FieldTemplates[properties.type]
        ? html`${FieldTemplates[properties.type](
            name,
            properties
          )}${FieldTemplates.helpText(properties.helpUrl, properties.helpText)}`
        : console.error(`Invalid field type: ${properties.type}`);
    }
    return '';
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
          ${FieldTemplates.button(
            this.data.submitButtonLabel || 'Submit',
            this._submitForm,
            !this.allFieldsValid
          )}
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
