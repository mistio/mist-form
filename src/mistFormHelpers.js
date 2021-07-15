import * as util from './utilities.js';

export class MistFormHelpers {
  constructor(mistForm, fieldTemplates) {
    this.mistForm = mistForm;
    this.fieldTemplates = fieldTemplates;
  }

  isEmpty() {
    const values = this.mistForm.getValuesfromDOM(this.shadowRoot);
    return Object.keys(values).length === 0;
  }

  updateState() {
    this.mistForm.allFieldsValid =
      this.fieldTemplates.formFieldsValid(this.mistForm.shadowRoot, true) ||
      this.mistFormHelpers.isEmpty();
  }

  attachInitialValue(props) {
    const _props = {...props};
    if (this.mistForm.initialValues) {
      const initialValue = util.getNestedValueFromPath(
        _props.fieldPath,
        this.mistForm.initialValues
      );
      if (initialValue !== undefined) {
        if (_props.format === 'subformContainer') {
          if (this.mistForm.firstRender) {
            _props.fieldsVisible = true;
          }
        } else {
          _props.value = initialValue;
          if (_props.format === 'multiRow') {
            _props.initialValue = initialValue;
          }
        }
      }
    }
    return _props;
  }

  getValuesfromDOM(root) {
    let formValues = {};
    const nodeList = this.fieldTemplates.getFirstLevelChildren(root);
    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.tagName === 'MIST-FORM-SUBFORM' && notExcluded) {
        // const domValues = this.getValuesfromDOM(node);
        const domValues = node.getValue();
        if (!util.valueNotEmpty(domValues)) {
          return {};
        }
        if (node.omitTitle) {
          formValues = { ...formValues, ...domValues };
        } else {
          formValues[node.name] = domValues;
        }
      } else if (notExcluded) {
        // const input = this.fieldTemplates.getFieldValue(node);
        const input = {
          [node.name]: node.value,
        };
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
