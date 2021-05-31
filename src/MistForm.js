import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
import * as util from './utilities.js';
import { mistFormStyles } from './styles/mistFormStyles.js';

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      dynamicDataNamespace: { type: Object },
      dynamicFieldData: { type: Object },
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button,
      value: { type: Object },
      initialValues: { type: Object },
      firstRender: { type: Boolean },
      subformOpenStates: { type: Object },
    };
  }

  static get styles() {
    return mistFormStyles;
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
    const nodeList = util.getFirstLevelChildren(root);

    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.classList.contains('subform-container') && notExcluded) {
        const domValues = this.getValuesfromDOM(node);
        if (!util.valueNotEmpty(domValues)) {
          return;
        }
        if (node.omitTitle) {
          formValues = { ...formValues, ...domValues };
        } else {
          formValues[node.getAttribute('name')] = domValues;
        }
      } else if (notExcluded) {
        const input = util.getFieldValue(node);
        const inputValue = Object.values(input)[0];
        if (node.type === 'number') {
          input[Object.keys(input)[0]] = parseInt(inputValue, 10);
        }
        if (node.saveAsArray && inputValue) {
          input[Object.keys(input)[0]] = inputValue
            .split(',')
            .map(val => val.trim());
        }
        const isInvalid = node && node.validate ? !node.validate() : false;
        const notEmpty = util.valueNotEmpty(inputValue);
        if (isInvalid) {
          this.allFieldsValid = false;
        } else if (notEmpty) {
          // If the input has a value of undefined and wasn't required, don't add it
          formValues = { ...formValues, ...input };
        }
      }
    });
    if (root.flatten) {
      formValues = Object.values(formValues).flat(1);
    }
    return formValues;
  }

  updateState() {
    this.allFieldsValid =
      util.formFieldsValid(this.shadowRoot, true) || this.isEmpty();
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

  // isDependantOnField(field, props, key, val) {
  //   return (
  //     Object.prototype.hasOwnProperty.call(val, 'x-mist-enum') &&
  //     this.dynamicDataNamespace &&
  //     this.dynamicDataNamespace[
  //       props[key]['x-mist-enum']
  //     ].dependencies.includes(field)
  //   );
  // }

  updateDynamicData(fieldPath) {
    console.log("fieldPath ", fieldPath)
    if (this.dynamicDataNamespace) {
      // Update dynamic properties
      this.dynamicDataNamespace.dynamicProperties.forEach(prop => {

      })
      for (const [key, val] of Object.entries(this.dynamicDataNamespace)) {
        if (val.dependencies && val.dependencies.includes(fieldPath)) {
          this.loadDynamicData(key, enumData => {
            const { target } = val;
            this.dynamicFieldData[target] = enumData;
            this.requestUpdate();
          });
        }
      }
    }
  }

  // Combine field and helpText and return template
  getTemplate(name, properties) {
    // console.log("properties ", properties)
    // if (this.dynamicDataNamespace) {
    //   this.dynamicDataNamespace.
    // }
    if (!properties.hidden) {
      return FieldTemplates[properties.type]
        ? html`${FieldTemplates[properties.type](
            name,
            properties,
            this,
            enumData => {
              this.dynamicDataNamespace[properties['x-mist-enum']].target =
                properties.fieldPath;
              this.dynamicFieldData[properties.fieldPath] = enumData;
              this.requestUpdate();
            }
          )}${FieldTemplates.helpText(properties)}`
        : console.error(`Invalid field type: ${properties.type}`);
    }
    return '';
  }

  submitForm() {
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
      this.value = params;

      this.dispatchEvent(event);
      if (slot) {
        slot.dispatchEvent(event);
      }
    } else {
      this.formError = 'There was a problem with the form';
    }
  }

  // Public methods
  loadDynamicData(dynamicDataName, cb) {
    if (this.dynamicDataNamespace) {
      this.dynamicDataNamespace[dynamicDataName].func
        // func is a promise
        // getEnumData is the function returned by the promise. We pass the values of the form there
        .then(getEnumData => {
          const formValues = this.getValuesfromDOM(this.shadowRoot);
          cb(getEnumData(formValues));
        })
        .catch(error => {
          console.error('Error loading dynamic data: ', error);
        });
    }
  }

  setSubformState(fieldPath, state) {
    this.subformOpenStates[fieldPath] = state;
  }

  getSubformState(fieldPath) {
    return this.subformOpenStates[fieldPath];
  }

  async dispatchValueChangedEvent(e) {
    // TODO: Debounce the event, especially when it comes from text input fields
    // TODO: I should check if this works for subform fields
    this.updateComplete.then(() => {
      const el = e.path[0];
      const [field, value] = Object.entries(util.getFieldValue(el))[0];
      let update = false;
      this.updateState(field, value, el);

      this.updateDynamicData(el.fieldPath);

      // TODO: inspect if this works for booleans
      if (!this.data.allOf) {
        return;
      }
      // Check if this works for subforms
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
    const children = this.shadowRoot.querySelectorAll('*');
    await Promise.all(Array.from(children).map(c => c.updateComplete));
    this.value = this.getValuesfromDOM(this.shadowRoot);
    const event = new CustomEvent('mist-form-value-changed', {
      detail: {
        value: this.value,
      },
    });
    this.dispatchEvent(event);
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.allFieldsValid = true;
    this.dynamicFieldData = {};
    this.value = {};
    this.subformOpenStates = {};
    this.firstRender = true;
  }

  firstUpdated() {
    this.getJSON(this.src);
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }
  }

  isEmpty() {
    const values = this.getValuesfromDOM(this.shadowRoot);
    return Object.keys(values).length === 0;
  }

  updated() {
    if (this.firstUpdated) {
      this.firstUpdated = false;
    }
  }

  renderInputs(inputs, subforms, path) {
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      const [name, properties] = input;
      // Subforms just contain data, they shouldn't be rendered by themselves.
      // They should be rendered in subform containers

      // If the field is a subform container, render its respective template, and hide/show fields
      if (properties.type === 'object') {
        const subForm = util.getSubformFromRef(
          subforms,
          properties.properties.subform.$ref
        );
        let parentPath;
        if (properties.omitTitle) {
          parentPath = path || '';
        } else {
          parentPath = path
            ? [path, properties.name].join('.')
            : properties.name;
        }

        const subFormInputs = Object.keys(subForm.properties).map(key => [
          key,
          {
            ...subForm.properties[key],
            hidden: properties.hidden || subForm.properties[key].hidden,
          },
        ]);
        properties.inputs = this.renderInputs(
          subFormInputs,
          subforms,
          parentPath
        );

      }
      else if(properties.type === 'multiRow') {
        const subForm = util.getSubformFromRef(
          subforms,
          properties.properties.subform.$ref
        );
        const rowProps = subForm.properties
        properties.rowProps = rowProps.map(prop => ({...prop, fieldPath: `${fieldPath}.${prop.name}`}));
      }
      const fieldName = properties.type === 'object' ? properties.name : name;
      properties.fieldPath = path ? [path, name].join('.') : fieldName;
      if (this.initialValues) {
        const initialValue = util.getNestedValueFromPath(
          properties.fieldPath,
          this.initialValues
        );
        if (initialValue !== undefined) {
          if (properties.type === 'object') {
            if (this.firstRender) {
              properties.fieldsVisible = true;
            }
          } else {
            const valueProperty = util.getValueProperty(properties);
            properties[valueProperty] = initialValue;
          }
        }
      }
      return this.getTemplate(name, properties);
    });
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonProperties = this.data.properties;
      const jsonDefinitions = this.data.definitions;
      const inputs = Object.keys(jsonProperties).map(key => [
        key,
        jsonProperties[key],
      ]);
      const subforms =
        jsonDefinitions &&
        Object.keys(jsonDefinitions).map(key => [key, jsonDefinitions[key]]);

      return html`
        <div class="mist-header">${this.data.label}</div>
        ${this.renderInputs(inputs, subforms)}

        <div class="buttons">
          ${util.displayCancelButton(this.data.canClose, this)}
          ${util.displaySubmitButton(this)}
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
}
