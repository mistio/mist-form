import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

// TODO: Clean up code when I'm done
// - Check if I actually need some functions to be static
// - Follow the same naming convention for functions
// - Convert data.properties to array for easier handling

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      dynamicDataNamespace: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      allFieldsValid: { type: Boolean },
      formValues: { type: Object },
    };
  }

  constructor() {
    super();
    this.fieldsValid = {};
    this.formValues = {};
  }

  firstUpdated() {
    this._getJSON(this.src);
  }

  _getJSON(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data;

        Object.keys(data.properties).forEach(fieldName => {
          this.fieldsValid[fieldName] = false;
        });
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  _clearDropdown({ id, format }) {
    // TODO: Check if I need to do this for radio buttons
    if (this.shadowRoot.querySelector(`#${id}`)) {
      if (format === 'dropdown') {
        this.shadowRoot.querySelector(`#${id} paper-listbox`).selected = null;
      } else if (format === 'radioGroup') {
        // The radio button seems to be cleared without doing anything
      }

      this.shadowRoot.querySelector(`#${id}`).value = null;
    }
  }

  updateState(field, value, el) {
    this.formValues[field] = value;
    this.fieldsValid[field] = el.validate && el.validate(value);
    // TODO: Show and hide subforms
    this.allFieldsValid = Object.values(this.fieldsValid).every(
      val => val === true
    );
  }

  updateFormByConditions(obj) {
    const [fieldName, prop] = obj;
    for (const [key, val] of Object.entries(prop)) {
      this.data.properties[fieldName][key] = val;

      const props = this.data.properties[fieldName];
      if (Object.prototype.hasOwnProperty.call(props, 'enum')) {
        this._clearDropdown(props);
      }
      if (
        key === 'hidden' &&
        !val &&
        !Object.prototype.hasOwnProperty.call(this, fieldName)
      ) {
        this.fieldsValid[fieldName] = false;
      }
    }
  }

  loadDynamicData(props, cb) {
    this.dynamicDataNamespace[props['x-mist-enum']].func
      .then(getEnumData => {
        cb(getEnumData(this.formValues));
      })
      .catch(error => {
        console.error('Error loading dynamic data: ', error);
      });
  }

  updateDynamicData(field) {
    const props = this.data.properties;
    for (const [key, val] of Object.entries(props)) {
      const isDynamic = Object.prototype.hasOwnProperty.call(
        val,
        'x-mist-enum'
      );

      const isDependantOnField =
        isDynamic &&
        this.dynamicDataNamespace[
          props[key]['x-mist-enum']
        ].dependencies.includes(field);
      if (isDependantOnField) {
        this.loadDynamicData(val, enumData => {
          this.data.properties[key].enum = enumData;
          this.requestUpdate();
        });
      }
    }
  }

  dispatchValueChangedEvent(e) {
    // TODO: Debounce the event, especially when it comes from text input fields
    const el = e.path[0];
    const field = el.name;
    const { value } = e.detail;
    let update = false;

    this.updateState(field, value, el);
    this.updateDynamicData(field);
    if (!this.data.allOf) {
      return;
    }

    this.data.allOf.forEach(conditional => {
      const condition = conditional.if.properties;
      const result = conditional.then.properties;
      const conditionMap = Object.keys(condition).map(key => [
        key,
        condition[key],
      ]);
      const resultMap = Object.keys(result).map(key => [key, result[key]]);
      const [targetField, targetValues] = conditionMap[0];
      const targetValuesArray = targetValues.enum || [targetValues.const];

      if (targetField === field && targetValuesArray.includes(value)) {
        update = true;
        resultMap.forEach(obj => {
          this.updateFormByConditions(obj);
        });
      }
    });
    if (update) {
      this.requestUpdate();
    }
  }

  // TODO: Style helpText better
  _getTemplate(name, properties) {
    if (!properties.hidden) {
      return FieldTemplates[properties.type]
        ? html`${FieldTemplates[properties.type](
            name,
            properties,
            this,
            enumData => {
              this.data.properties[name].enum = enumData;
              this.requestUpdate();
            }
          )}${FieldTemplates.helpText(properties.helpUrl, properties.helpText)}`
        : console.error(`Invalid field type: ${properties.type}`);
    }
    return '';
  }

  static _displayCancelButton = (canClose = true) =>
    canClose ? FieldTemplates.button('Cancel') : '';

  _submitForm() {
    let allFieldsValid = true;
    const params = [];

    this.shadowRoot
      .querySelectorAll(FieldTemplates.getInputFields().join(','))
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
        ${inputs.map(input => {
          const [name, properties] = input;

          if (properties.hidden) {
            delete this.fieldsValid[name];
          }
          return this._getTemplate(name, properties);
        })}
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
