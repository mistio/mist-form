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
    this.mistForm.allFieldsValid = this.fieldTemplates.formFieldsValid(
      this.mistForm.shadowRoot
    );
    this.mistForm.shadowRoot
      .querySelector('#submit-btn')
      .setDisabled(!this.mistForm.allFieldsValid);
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
        }
      }
    }
    return _props;
  }

  getValuesfromDOM(root) {
    if (!root) {
      return {};
    }
    let formValues = {};
    const nodeList = this.fieldTemplates.getFirstLevelChildren(root);
    nodeList.forEach(node => {
      const inputName = node.name;
      const notExcluded = !node.hasAttribute('excludefrompayload');

      if (node.tagName === 'MIST-FORM-SUBFORM' && notExcluded) {
        const domValues = node.getValue();
        if (!util.valueNotEmpty(domValues)) {
          return {};
        }
        if (node.props.omitTitle) {
          formValues = { ...formValues, ...domValues };
        } else {
          formValues[inputName] = domValues;
        }
      } else if (notExcluded) {
        if (util.valueNotEmpty(node.value)) {
          // If the input has a value of undefined and wasn't required, don't add it
          const inputValue = util.formatInputValue(node);
          formValues = { ...formValues, [inputName]: inputValue };
        }
      }
      return false;
    });
    if (root.flatten) {
      formValues = Object.values(formValues).flat(1);
    }

    return formValues;
  }

  setInput(contents) {
    const _contents = { ...contents };

    if (_contents.format !== 'subformContainer') {
      for (const [key, val] of Object.entries(_contents.properties)) {
        _contents.properties[key].name = val.name || key;
        _contents.properties[key].fieldType = this.fieldTemplates.getFieldType(
          val
        );

        if (Array.isArray(val.value)) {
          _contents.properties[key].value = val.value.join(', ');
        }
      }
    } else {
      _contents.fieldType = 'subformContainer';
    }

    return _contents;
  }

  displaySubmitButton = () =>
    this.fieldTemplates.button({
      label: this.mistForm.data.submitButtonLabel || 'Submit',
      disabled: !this.mistForm.allFieldsValid,
      classes: 'submit-btn',
      id: 'submit-btn',
      valueChangedEvent: () => {
        this.mistForm.submitForm();
      },
    });

  displayCancelButton = (canClose = true) =>
    canClose
      ? this.fieldTemplates.button({
          label: 'Cancel',
          classes: 'cancel-btn',
          id: 'cancel-btn',
          valueChangedEvent: () => {
            this.mistForm.dispatchEvent(new CustomEvent('mist-form-cancel'));
          },
        })
      : '';
}
