import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

// TODO: Clean up code when I'm done
// - Convert data.properties to array for easier handling

const displayCancelButton = (canClose = true) =>
  canClose ? FieldTemplates.button('Cancel') : '';

const getFieldValue = input => ({
  [input.id]:
    input.getAttribute('role') === 'checkbox' ? input.checked : input.value,
});

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      dynamicDataNamespace: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button
      formValues: { type: Object },
    };
  }

  // "Private" Methods
  getJSON(url) {
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

  clearDropdown({ id, format }) {
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
    this.allFieldsValid = Object.values(this.fieldsValid).every(
      val => val === true
    );
  }

  // Set the new field properties as described in the condition map
  updateFormByConditions(condition) {
    const [fieldName, prop] = condition;
    for (const [key, val] of Object.entries(prop)) {
      const props = this.data.properties[fieldName];
      const hasEnum = Object.prototype.hasOwnProperty.call(props, 'enum');
      // Update field with the new value
      this.data.properties[fieldName][key] = val;

      if (hasEnum) {
        // Reset dropdowns
        this.clearDropdown(props);
      }

      // If field gets added to form(hidden becomes false), set it's validity to false
      if (key === 'hidden' && !val) {
        this.fieldsValid[fieldName] = false;
      }
    }
  }

  // TODO change the name of this function
  isDependantOnField = (field, props, key, val) => {
    return (
      Object.prototype.hasOwnProperty.call(val, 'x-mist-enum') &&
      this.dynamicDataNamespace &&
      this.dynamicDataNamespace[
        props[key]['x-mist-enum']
      ].dependencies.includes(field)
    );
  };

  updateDynamicData(field) {
    const props = this.data.properties;
    for (const [key, val] of Object.entries(props)) {
      if (this.isDependantOnField(field, props, key, val)) {
        this.loadDynamicData(val, enumData => {
          props[key].enum = enumData;
          this.requestUpdate();
        });
      }
    }
  }

  // Combine field and helpText and return template
  getTemplate(name, properties) {
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
          )}${FieldTemplates.helpText(properties)}`
        : console.error(`Invalid field type: ${properties.type}`);
    }
    return '';
  }

  submitForm() {
    let allFieldsValid = true;
    const params = [];

    this.shadowRoot
      .querySelectorAll(FieldTemplates.getInputFields().join(','))
      .forEach(input => {
        const isInvalid = !input.validate();
        if (isInvalid) {
          allFieldsValid = false;
        } else {
          params.push(getFieldValue(input));
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

  // Public methods
  loadDynamicData(props, cb) {
    if (this.dynamicDataNamespace) {
      this.dynamicDataNamespace[props['x-mist-enum']].func
        .then(getEnumData => {
          cb(getEnumData(this.formValues));
        })
        .catch(error => {
          console.error('Error loading dynamic data: ', error);
        });
    }
  }

  dispatchValueChangedEvent(e) {
    // TODO: Show and hide subforms
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

        resultMap.forEach(res => {
          this.updateFormByConditions(res);
        });
      }
    });
    if (update) {
      this.requestUpdate();
    }
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.fieldsValid = {};
    this.formValues = {};
  }

  firstUpdated() {
    this.getJSON(this.src);
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
          return this.getTemplate(name, properties);
        })}
        <div>
          ${displayCancelButton(this.data.canClose)}
          ${FieldTemplates.button(
            this.data.submitButtonLabel || 'Submit',
            this.submitForm,
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
