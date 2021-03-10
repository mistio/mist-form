import { html, css, LitElement } from 'lit-element';
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

// Get first level input children
const getFirstLevelChildren = root =>
  [...root.children].filter(child =>
    child.matches(FieldTemplates.getInputFields())
  );
// Traverse all fields in DOM and validate them
function formFieldsValid(root, isValid) {
  const nodeList = getFirstLevelChildren(root);
  let formValid = isValid;
  nodeList.forEach(node => {
    if (node.classList.contains('subform-container')) {
      formValid = formFieldsValid(node, formValid);
    } else if (!node.hasAttribute('exclude')) {
      const isInvalid = !node.validate();
      if (isInvalid) {
        formValid = false;
      }
    }
  });
  return formValid;
}
export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      dynamicDataNamespace: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button
      formValues: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--mist-form-text-color, black);
        background: var(--mist-form-background-color, white);
        font-family: var(--mist-form-font-family, Roboto);
      }
      .subform-container {
        border: var(--mist-form-border, 1px solid black);
        margin: var(--mist-form-margin, 2px);
        padding: var(--mist-form-padding, 2px);
      }
      :host([hidden]) {
        display: none;
      }
    `;
  }

  // "Private" Methods
  getJSON(url) {
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

  getValuesfromDOM(root) {
    let formValues = {};
    const nodeList = getFirstLevelChildren(root);
    nodeList.forEach(node => {
      if (node.classList.contains('subform-container')) {
        formValues[node.getAttribute('name')] = this.getValuesfromDOM(node);
      } else if (!node.hasAttribute('exclude')) {
        const inputValue = getFieldValue(node);
        const isInvalid = !node.validate();
        if (isInvalid) {
          this.allFieldsValid = false;
        } else if (Object.values(inputValue)[0] !== undefined) {
          // If the input has a value of undefined and wasn't required, don't add it
          formValues = { ...formValues, ...getFieldValue(node) };
        }
      }
    });

    return formValues;
  }

  updateState(field, value) {
    this.formValues[field] = value;
    this.allFieldsValid = formFieldsValid(this.shadowRoot, true);
  }

  updateFieldByConditions(props, fieldName, key, val) {
    const hasEnum = Object.prototype.hasOwnProperty.call(props, 'enum');

    this.data.properties[fieldName][key] = val;
    if (hasEnum) {
      // Reset dropdowns
      this.clearDropdown(props);
    }
  }

  // TODO Add button to clear the entire form and/or restore defaults
  // Set the new field properties as described in the condition map
  updateFormByConditions(condition) {
    const [fieldName, prop] = condition;

    for (const [key, val] of Object.entries(prop)) {
      const props = this.data.properties[fieldName];
      // Update field with the new value
      this.updateFieldByConditions(props, fieldName, key, val);
    }
  }

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
    // TODO: just add a class to elements to be able to select stuff
    // TODO: Just search for elements on the top level. If an element is a subform, get its children
    // if one of them is a subform get it's children and so on.

    const params = this.getValuesfromDOM(this.shadowRoot);
    if (Object.keys(params).length === 0) {
      this.formError = 'Please insert some data';
    } else if (this.allFieldsValid) {
      const slot = this.shadowRoot
        .querySelector('slot[name="formRequest"]')
        .assignedNodes()[0];

      const event = new CustomEvent('mist-form-request', {
        detail: {
          params,
        },
      });
      slot.dispatchEvent(event);
    } else {
      this.formError = 'There was a problem with the form';
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
    //  this.updateComplete.then(() => {
    // TODO: Debounce the event, especially when it comes from text input fields
    this.updateComplete.then(() => {
      const el = e.path[0];
      const field = el.name;
      const { value } = e.detail;
      let update = false;

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
    });
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.allFieldsValid = false;
    this.formValues = {};
  }

  firstUpdated() {
    this.getJSON(this.src);
  }

  updated() {
    this.allFieldsValid = formFieldsValid(this.shadowRoot, true);
  }

  renderInputs(inputs, subforms) {
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      const [name, properties] = input;
      // Subforms just contain data, they shouldn't be rendered by themselves.
      // They should be rendered in subform containers

      // If the field is a subform container, render its respective template, and hide/show fields
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
        properties.inputs = this.renderInputs(subFormInputs, subforms);
      }
      return this.getTemplate(name, properties);
    });
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;

      const fields = Object.keys(jsonData).map(key => [key, jsonData[key]]);
      const inputs = fields.filter(field => field[1].type !== 'subform');
      console.log('inputs ', inputs);
      const subforms = fields.filter(field => field[1].type === 'subform');
      return html`
        <div>${this.data.label}</div>
        ${this.renderInputs(inputs, subforms)}

        <div>
          ${displayCancelButton(this.data.canClose)}
          ${FieldTemplates.button(
            this.data.submitButtonLabel || 'Submit',
            this.submitForm,
            !this.allFieldsValid
          )}
        </div>
        <div class="formError">${this.formError}</div>
        <slot name="formRequest"></slot>
      `;
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return FieldTemplates.spinner;
  }

  field;
}
