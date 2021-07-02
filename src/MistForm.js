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
      conditionalData: {type: Object},
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button,
      initialValues: { type: Object },
      subformOpenStates: { type: Object },
    };
  }

  static get styles() {
    return mistFormStyles;
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.allFieldsValid = true;
    this.dynamicFieldData = {};
    this.conditionalData = {};
    this.value = {};
    this.subformOpenStates = {};
    this.customComponents = {};
    this.firstRender = true;
    this.fieldTemplates = new FieldTemplates(
      this,
      this.dispatchValueChangedEvent
    );
  }

  firstUpdated() {
    this.getJSON(this.src);
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }

    this.setupCustomComponents();
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
      const formFields = this.renderInputs(inputs, subforms);
      if (this.firstRender) {
        this.firstRender = false;
      }
      return html`
        <div class="mist-header">${this.data.label}</div>
        ${formFields}

        <div class="buttons">
          ${this.fieldTemplates.displayCancelButton(this.data.canClose, this)}
          ${this.fieldTemplates.displaySubmitButton(this)}
        </div>
        <div class="formError">${this.formError}</div>
        <slot name="formRequest"></slot>
      `;
      // TODO: Check if I really need slots
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return this.fieldTemplates.spinner;
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
    const nodeList = this.fieldTemplates.getFirstLevelChildren(root);

    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.classList.contains('subform-container') && notExcluded) {
        const domValues = this.getValuesfromDOM(node);
        if (!util.valueNotEmpty(domValues)) {
          return {};
        }
        if (node.omitTitle) {
          formValues = { ...formValues, ...domValues };
        } else {
          formValues[node.name] = domValues;
        }
      } else if (notExcluded) {
        const input = this.fieldTemplates.getFieldValue(node);
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
      return false;
    });
    if (root.flatten) {
      formValues = Object.values(formValues).flat(1);
    }
    return formValues;
  }

  updateState() {
    this.allFieldsValid =
      this.fieldTemplates.formFieldsValid(this.shadowRoot, true) ||
      this.isEmpty();
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

  loadDynamicData(dynamicDataName, fieldPath) {
    if (
      this.dynamicDataNamespace && this.dynamicDataNamespace.dynamicData &&
      this.dynamicDataNamespace.dynamicData[dynamicDataName]
    ) {
      return (
        this.dynamicDataNamespace.dynamicData[dynamicDataName].func
          // func is a promise
          // getEnumData is the function returned by the promise. We pass the values of the form there
          .then(getEnumData => {
            const formValues = this.getValuesfromDOM(this.shadowRoot);
            const {dependencies} = this.dynamicDataNamespace.dynamicData[dynamicDataName];
            const dependencyValues = dependencies ? util.getDependencyValues(formValues, dependencies) : {};

            const enumData = getEnumData(dependencyValues);

            this.dynamicDataNamespace.dynamicData[dynamicDataName].target = fieldPath;
            this.dynamicFieldData[fieldPath] = enumData;
            this.requestUpdate();

            return enumData;
          })
          .catch(error => {
            console.error('Error loading dynamic data: ', error);
          })
      );
    }
    return false;
  }

  updateDynamicData(fieldPath) {
    if (this.dynamicDataNamespace && this.dynamicDataNamespace.dynamicData) {
      // Update dynamic data that depends on dependencies
      for (const [key, val] of Object.entries(this.dynamicDataNamespace.dynamicData)) {
        if (val.dependencies && val.dependencies.includes(fieldPath)) {
          this.loadDynamicData(key, val.target);
        }
      }
    }
  }

  updateCustomValues(fieldPath, value) {
    this.customValues[fieldPath] = value;
  }

  // Combine field and helpText and return template
  getTemplate(properties) {
    if (!properties.hidden) {
      const fieldType = properties.type || properties.format;
      if (fieldType && this.fieldTemplates[fieldType]) {
        const template = this.fieldTemplates[fieldType](properties);
        const helpTextTemplate = this.fieldTemplates.helpText(properties);
        return html` ${template}${helpTextTemplate}`;
      }
      console.error(`Invalid field type: ${fieldType}`);
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

  setSubformState(fieldPath, state) {
    this.subformOpenStates[fieldPath] = state;
  }

  getSubformState(fieldPath) {
    return this.subformOpenStates[fieldPath];
  }

  shouldUpdateForm(fieldPath, value) {
    let update = false;
    if (this.dynamicDataNamespace && this.dynamicDataNamespace.conditionals) {
      // Update dynamic data that depends on dependencies
      for (const [key, val] of Object.entries(this.dynamicDataNamespace.conditionals)) {
        if (val.dependencies && val.dependencies.includes(fieldPath)) {

          this.conditionalData[fieldPath] = val.func(this.getValuesfromDOM(this.shadowRoot));
          this.requestUpdate();
          // this.loadDynamicData(key, val.target);
        }
      }
    }
    if (this.data.allOf) {
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
          targetField === fieldPath &&
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

          if (targetField === fieldPath && targetValuesArray.includes(value)) {
            update = true;

            resultMap.forEach(res => {
              this.updateFormByConditions(res);
            });
          }
        }
      });
    }
    return update;
  }

  dispatchValueChangedEvent = async e => {
    // TODO: Debounce the event, especially when it comes from text input fields
    // TODO: I should check if this works for subform fields
    this.updateComplete.then(() => {
      const el = e.path[0];

      if (el.getRootNode().host.tagName === 'MULTI-ROW') {
        el.getRootNode().host.requestUpdate();
      }
      const [value] = Object.entries(this.fieldTemplates.getFieldValue(el))[0];

      this.updateState();

      this.updateDynamicData(el.fieldPath);
      if (el.hasAttribute('mist-form-type')) {
        // this.updateCustomValues(el.fieldPath, value)
      }

    //  if (this.data.allOf) {
        if (this.shouldUpdateForm(el.fieldPath, value)) {
          this.requestUpdate();
        }
     // }
      // Check if this works for subforms
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
  };

  setupCustomComponents() {
    // Get custom components from slot
    const customComponents =
      this.querySelector('#mist-form-custom') &&
      this.querySelector('#mist-form-custom').children;
    if (!customComponents) {
      return;
    }
    // Setup their properties
    for (const el of customComponents) {
      if (el.attributes['mist-form-type']) {
        const componentName = el.attributes['mist-form-type'].value;
        this.fieldTemplates.customInputFields.push({
          name: componentName,
          tagName: el.tagName,
          valueChangedEvent: el.valueChangedEvent,
          valueProp: (el.attributes['mist-form-value-prop'] && el.attributes['mist-form-value-prop'].value) || 'value'
          // Add the value prop here
        });
        this.fieldTemplates[componentName] = props => {
          if (!this.customComponents[props.fieldPath]) {
            this.customComponents[props.fieldPath] = el.cloneNode();
          }

          const customElement = this.customComponents[props.fieldPath];

          for (const [key, val] of Object.entries(props)) {
            customElement.setAttribute(key, val);
           // customElement.setValue[props.fieldPath]
            customElement[key] = val;
          }
          // Set value through this.customValues
          // First I need to set a way to get value
          // elClone.setAttribute()

         // const cl = elClone.cloneNode();
          return customElement;
        };
      }
    }
    // Add event listeners for custom components
    const eventNames = this.fieldTemplates.getUniqueEventNames();
    for (const eventName of eventNames) {
      this.addEventListener(eventName, e => {
        this.dispatchValueChangedEvent(e);
      });
    }
  }

  isEmpty() {
    const values = this.getValuesfromDOM(this.shadowRoot);
    return Object.keys(values).length === 0;
  }

  refreshCustomComponents(fieldPath) {
    const subformOpen = this.getSubformState(fieldPath);
    if (!subformOpen) {
      for (const [key] of Object.entries(this.customComponents)) {
        if (key.startsWith(fieldPath)) {
          delete this.customComponents[key];
        }
      }
    }
  }

  getDependencyValues() {

  }

  renderInputs(inputs, subforms, path) {
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      const [name, properties] = input;
      // Subforms just contain data, they shouldn't be rendered by themselves.
      // They should be rendered in subform containers
      const fieldName = properties.type === 'object' ? properties.name : name;
      properties.name = fieldName;

      // TODO: Should this be [path, name].join('.') or [path, fieldName].join('.')?


      properties.fieldPath = path ? [path, name].join('.') : fieldName;
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
      } else if (properties.format === 'multiRow') {
        const subForm = util.getSubformFromRef(
          subforms,
          properties.properties.subform.$ref
        );
        const rowProps = subForm.properties;
        properties.rowProps = {};
        for (const [key, val] of Object.entries(rowProps)) {
          properties.rowProps[key] = {
            name: key,
            ...val, // If user gave a separate name it will be overwritten here
            fieldPath: `${properties.fieldPath}.${val.name || key}`,
          };
        }
      }
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
            const valueProperty = this.fieldTemplates.getValueProperty(properties);
            properties[valueProperty] = initialValue;
            if (properties.format === 'multiRow') {
              properties.initialValue = initialValue;
            }
          }
        }
      }
      if (properties.deps) {
        for (const [key, val] of Object.entries(properties.deps)) {
          const formValues = this.getValuesfromDOM(this.shadowRoot);
          const {dependencies} = this.dynamicDataNamespace.conditionals[val];
          const dependencyValues = util.getDependencyValues(formValues, dependencies);
          const newData = this.dynamicDataNamespace.conditionals[val].func(dependencyValues);

          if (newData !== undefined) {
            properties[key] = newData;
          }
        }
      }
      return this.getTemplate(properties);
    });
  }
}
