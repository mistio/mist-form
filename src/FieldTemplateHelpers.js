export class FieldTemplateHelpers {
  // Traverse all fields in DOM and validate them
  formFieldsValid(root) {
    const nodeList = this.getFirstLevelChildren(root);
    let formValid = true;
    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.tagName === 'MIST-FORM-SUBFORM' && notExcluded) {
        // formValid = this.formFieldsValid(node, formValid);
        formValid = node.getFieldsValid();
      } else if (notExcluded) {
        const isInvalid =
          node.validate && node.validate ? !node.validate() : false;
        if (isInvalid) {
          formValid = false;
        }
      }
    });
    return formValid;
  }

  // Get first level input children
  getFirstLevelChildren = root => {
    return [...root.children].filter(child => child.matches(this.inputFields));
  };

  displaySubmitButton() {
    return this.button(
      this.mistForm.data.submitButtonLabel || 'Submit',
      () => {
        this.mistForm.submitForm();
      },
      !this.mistForm.allFieldsValid,
      'submit-btn'
    );
  }

  displayCancelButton(canClose = true) {
    // TODO: Add functionality to cancel button
    return canClose
      ? this.button(
          'Cancel',
          () => {
            this.mistForm.dispatchEvent(new CustomEvent('mist-form-cancel'));
          },
          null,
          'cancel-btn'
        )
      : '';
  }

  // getValueProperty(props) {
  //   const customInputFields = this.customInputFields.find(customInput => {
  //     return props.type === customInput.name;
  //   });

  //   if (props.format === 'checkboxGroup') {
  //     return 'selectedValues';
  //   }
  //   if (props.type === 'boolean') {
  //     return 'checked';
  //   }
  //   if (customInputFields) {
  //     return customInputFields && customInputFields.valueProp;
  //   }
  //   return 'value';
  // }

  // getFieldValue(input) {
  //   let value;

  //   if (
  //     input.getAttribute('role') === 'checkbox' ||
  //     input.getAttribute('role') === 'button'
  //   ) {
  //     value = input.checked;
  //   } else if (input.tagName === 'IRON-SELECTOR') {
  //     value = input.selectedValues;
  //   } else if (input.tagName === 'PAPER-DROPDOWN-MENU') {
  //     value = input.selectedItem && input.selectedItem.getAttribute('item-id');
  //   } else

  //   if (input.format === 'multiRow') {
  //     value = input.getValue();
  //   } else {
  //     value = input.value;
  //   }
  //   return {
  //     [input.name]: value,
  //   };
  // }
}
