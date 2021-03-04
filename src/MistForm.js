import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';

// TODO: Clean up code when I'm done
// - Convert data.properties to array for easier handling
// TODO: The user should have the option to either attach a subform to a subform container
// This way, they can either have a subform that they repeat multiple times, or just unique ones
// For now, they need to define a subform container and a corresponding subform
// TODO: Check validations
const displayCancelButton = (canClose = true) =>
  canClose ? FieldTemplates.button('Cancel') : '';

const getFieldValue = input => ({
  [input.id]:
    input.getAttribute('role') === 'checkbox' ||
    input.getAttribute('role') === 'button'
      ? input.checked
      : input.value,
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
        // Attach subforms
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

  updateFieldByConditions(props, fieldName, key, val) {
    const hasEnum = Object.prototype.hasOwnProperty.call(props, 'enum');

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

  // TODO Add button to clear the entire form and/or restore defaults
  // Set the new field properties as described in the condition map
  updateFormByConditions(condition) {
    console.log('condition ', condition);
    const [fieldName, prop] = condition;

    for (const [key, val] of Object.entries(prop)) {
      const props = this.data.properties[fieldName];

      const fieldType = props.type;
      // Update field with the new value

      if (fieldType === 'Wsubform_container') {
        this.data.properties[fieldName][key] = val;
        const subFields = this.data.properties[fieldName].properties;
        console.log('subFields ', subFields);
        for (const [key2, data] of Object.entries(subFields)) {
          this.updateFieldByConditions(data, fieldName, key2, val);
        }
      } else {
        this.updateFieldByConditions(props, fieldName, key, val);
      }
    }
  }

  // TODO change the name of this function
  isDependantOnField(field, props, key, val) {
    return (
      Object.prototype.hasOwnProperty.call(val, 'x-mist-enum') &&
      this.dynamicDataNamespace &&
      this.dynamicDataNamespace[
        props[key]['x-mist-enum']
      ].dependencies.includes(field)
    );
  }

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
    // TODO: just add a class to elements to be able to select stuff
    // TODO: Just search for elements on the top level. If an element is a subform, get it's children
    // if one of them is a subform get it's children and so on.
    this.shadowRoot
      .querySelectorAll(FieldTemplates.getInputFields().join(','))
      .forEach(input => {
        console.log('input ');
        if (input.classList.contains('subform-container')) {
          console.log('input.childNodes ', input.childNodes);
        }
        const isInvalid =
          !input.classList.contains('subform-container') && !input.validate();
        if (isInvalid) {
          allFieldsValid = false;
        } else {
          console.log('input ', input);
          params.push(getFieldValue(input));
        }
      });
    allFieldsValid = true;
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
    console.log('field ', field);

    this.updateState(field, value, el);
    this.updateDynamicData(field);

    // TODO inspect if this works for booleans
    if (!this.data.allOf) {
      return;
    }
    // Check
    this.data.allOf.forEach(conditional => {
      const condition = conditional.if.properties;
      const result = conditional.then.properties;
      const conditionMap = Object.keys(condition).map(key => [
        key,
        condition[key],
      ]);

      const resultMap = Object.keys(result).map(key => [key, result[key]]);
      const [targetField, targetValues] = conditionMap[0];
      if (
        targetField === field &&
        (targetValues === 'toggle' || targetValues === 'reverseToggle')
      ) {
        update = true;
        const toggleValue = targetValues === 'toggle' ? value : !value;
        const updatedResult = [
          resultMap[0][0],
          { [resultMap[0][1].property]: toggleValue },
        ];
        // updatedResult[1][resultMap[0][1].property] = toggleValue;
        console.log('updatedREsult ', updatedResult);
        this.updateFormByConditions(updatedResult);
      } else {
        const targetValuesArray = targetValues.enum || [targetValues.const];

        if (targetField === field && targetValuesArray.includes(value)) {
          update = true;

          resultMap.forEach(res => {
            this.updateFormByConditions(res);
          });
        }
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

  renderInputs(inputs, subforms) {
    console.log('in render inputs');
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      const [name, properties] = input;
      // Subforms just contain data, they shouldn't be rendered by themselves.
      // They should be rendered in subform containers
      if (properties.hidden) {
        delete this.fieldsValid[name];
      }

      // If the field is a subform container, render it's respective template, and hide/show fields
      if (properties.type === 'subform_container') {
        const subForm = subforms.find(el => el[0] === properties.value)[1];
        // todo give unique ids to fields here?
        const subFormInputs = Object.keys(subForm.properties).map(key => [
          key,
          {
            ...subForm.properties[key],
            hidden: properties.hidden || subForm.properties[key].hidden,
          },
        ]);
        // console.log("subFormInputs ", subFormInputs)
        properties.inputs = this.renderInputs(subFormInputs, subforms);
        //  return this.getTemplate(name, properties);
      }

      // console.log("properties ", properties)
      return this.getTemplate(name, properties);
    });
  }

  // Construct form fields from subform data.
  getSubformData(inputs, subforms, parentName, parentId) {
    const subformFields = [];
    inputs.forEach(input => {
      const name = input[0];
      const { type, id } = input[1];
      if (type === 'subform_container') {
        const subForm = subforms.find(el => el[0] === input[1].value);
        const fields = subForm[1].properties;
        const nestedInputs = Object.keys(fields).map(key => [key, fields[key]]);
        subformFields.push(
          ...this.getSubformData(nestedInputs, subforms, name, id)
        );
      } else if (type !== 'subform') {
        const newKey = parentName ? `${parentName}_${name}` : name;
        const newId = parentId ? `${parentId}_${id}` : id;
        subformFields.push([
          newKey,
          { ...input[1], id: newId, parent: parentName },
        ]);
      }
    });

    return subformFields;
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;

      const fields = Object.keys(jsonData).map(key => [key, jsonData[key]]);
      const fieldsWithoutSubforms = fields.filter(
        field => field[1].type !== 'subform'
      );
      const subforms = fields.filter(field => field[1].type === 'subform');
      // const subFormFields = this.getSubformData(fields, subforms);
      const inputs = [...fieldsWithoutSubforms];
      console.log('-------------');
      return html`
        <div>${this.data.label}</div>
        ${this.renderInputs(inputs, subforms)}

        <div>
          ${displayCancelButton(this.data.canClose)}
          ${FieldTemplates.button(
            this.data.submitButtonLabel || 'Submit',
            this.submitForm,
            this.allFieldsValid
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
