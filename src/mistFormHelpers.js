import * as util from './utilities.js';
export class MistFormHelpers {
  constructor(mistForm, fieldTemplates) {
    this.mistForm = mistForm;
    this.fieldTemplates = fieldTemplates;
  }
  getInputs(data) {
    const jsonProperties = data.properties;
    const inputs = Object.keys(jsonProperties).map(key => [
      key,
      jsonProperties[key],
    ]);

    return inputs;
  }

  getSubforms(data) {
    const jsonDefinitions = data.definitions;
    const subforms =
      jsonDefinitions &&
      Object.keys(jsonDefinitions).map(key => [key, jsonDefinitions[key]]);
    return subforms;
  }
  isEmpty() {
    const values = this.getValuesfromDOM(this.shadowRoot);
    return Object.keys(values).length === 0;
  }

  updateState() {
    this.mistForm.allFieldsValid =
      this.fieldTemplates.formFieldsValid(this.shadowRoot, true) ||
      this.mistFormHelpers.isEmpty();
  }

  attachInitialValue(properties) {
    if (this.mistForm.initialValues) {
      const initialValue = util.getNestedValueFromPath(
        properties.fieldPath,
        this.mistForm.initialValues
      );
      if (initialValue !== undefined) {
        if (properties.format === 'subformContainer') {
          if (this.mistForm.firstRender) {
            properties.fieldsVisible = true;
          }
        } else {
          const valueProperty = this.fieldTemplates.getValueProperty(
            properties
          );
          properties[valueProperty] = initialValue;
          if (properties.format === 'multiRow') {
            properties.initialValue = initialValue;
          }
        }
      }
    }
    return properties;
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
          this.mistForm.allFieldsValid = false;
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
}
