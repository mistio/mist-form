import * as util from './utilities.js';

export class MistFormHelpers {
  constructor(mistForm, fieldTemplates) {
    this.mistForm = mistForm;
    this.fieldTemplates = fieldTemplates;
  }

  isEmpty() {
    const values = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    return Object.keys(values).length === 0;
  }

  updateState() {
    this.mistForm.allFieldsValid =
      this.fieldTemplates.formFieldsValid(this.mistForm.shadowRoot) ||
      this.isEmpty();
  }

  attachInitialValue(props) {
    const _props = { ...props };
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
        const isInvalid = util.isInvalid(node);
        const notEmpty = util.valueNotEmpty(node.value);

        if (isInvalid) {
          this.mistForm.allFieldsValid = false;
        } else if (notEmpty) {
          // If the input has a value of undefined and wasn't required, don't add it
          const inputValue = util.formatInputValue(node);
          const inputName = node.name;

          const input = {
            [inputName]: inputValue,
          };
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
