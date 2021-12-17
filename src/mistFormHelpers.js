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

  // Initial values are values that are passed to mist-form, not default values defined in the schema
  attachInitialValue(props, parentProps) {
    const _props = { ...props };
    const fieldPath =
      parentProps && parentProps.omitTitle
        ? _props.fieldPath.split('.').splice(-2, 1).join('.')
        : _props.fieldPath;

    if (this.mistForm.initialValues) {
      // Fix this
      const initialValue = util.getNestedValueFromPath(
        fieldPath,
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

  getValuesfromDOM(root, byName) {
    if (!root) {
      return {};
    }
    let formValues = {};
    // If root is the root of mist-form, search in mist-form-fields instead of root
    const nodeList = this.fieldTemplates.getFirstLevelChildren(root);
    nodeList.forEach(node => {
      const inputName = node.name;
      const notExcluded = !node.hasAttribute('excludefrompayload');
      if (node.tagName === 'MIST-FORM-SUBFORM' && notExcluded) {
        const domValues = node.getValue(byName);
        if (!util.valueNotEmpty(domValues)) {
          return {};
        }
        if (node.props.omitTitle && byName) {
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

  setField(contents) {
    const _contents = { ...contents };

    if (_contents.format !== 'subformContainer') {
      for (const [key, val] of Object.entries(_contents.properties)) {
        _contents.properties[key].name = val.name || key;
        _contents.properties[key].key = key;
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
